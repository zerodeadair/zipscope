from datetime import date
from decimal import Decimal

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.property import County, DataSource, MedianZipValue, State, ZipCode, ZipCountyCrosswalk


def get_or_create(session, model, lookup: dict, values: dict | None = None):
    instance = session.scalar(select(model).filter_by(**lookup))
    if instance:
        return instance
    instance = model(**lookup, **(values or {}))
    session.add(instance)
    session.flush()
    return instance


def seed() -> None:
    with SessionLocal() as session:
        fl = get_or_create(session, State, {"state_code": "FL"}, {"name": "Florida", "fips_code": "12"})
        nc = get_or_create(session, State, {"state_code": "NC"}, {"name": "North Carolina", "fips_code": "37"})

        hillsborough = get_or_create(
            session,
            County,
            {"state_id": fl.id, "fips_code": "12057"},
            {"name": "Hillsborough County", "county_seat": "Tampa"},
        )
        surry = get_or_create(
            session,
            County,
            {"state_id": nc.id, "fips_code": "37171"},
            {"name": "Surry County", "county_seat": "Dobson"},
        )

        zip_33558 = get_or_create(
            session,
            ZipCode,
            {"zip_code": "33558"},
            {"primary_city": "Lutz", "state_code": "FL"},
        )
        zip_27030 = get_or_create(
            session,
            ZipCode,
            {"zip_code": "27030"},
            {"primary_city": "Mount Airy", "state_code": "NC"},
        )

        get_or_create(session, ZipCountyCrosswalk, {"zip_code_id": zip_33558.id, "county_id": hillsborough.id})
        get_or_create(session, ZipCountyCrosswalk, {"zip_code_id": zip_27030.id, "county_id": surry.id})

        census_source = get_or_create(
            session,
            DataSource,
            {"name": "Census Reporter ACS 2024 5-year profile", "jurisdiction_type": "national", "jurisdiction_id": None},
            {
                "source_type": "census_profile",
                "base_url": "https://censusreporter.org/",
                "access_notes": "Public ACS profile source used for ZIP/ZCTA housing anchors.",
                "refresh_frequency": "monthly",
            },
        )
        get_or_create(
            session,
            DataSource,
            {"name": "Hillsborough County Property Appraiser", "jurisdiction_type": "county", "jurisdiction_id": hillsborough.id},
            {
                "source_type": "county_property_appraiser",
                "state_code": "FL",
                "county_id": hillsborough.id,
                "base_url": "https://gis.hcpafl.org/PropertySearch/",
                "access_notes": "Official public parcel/property-card source. Phase 1 registry entry only.",
                "refresh_frequency": "monthly",
            },
        )
        get_or_create(
            session,
            DataSource,
            {"name": "Surry County Register of Deeds", "jurisdiction_type": "county", "jurisdiction_id": surry.id},
            {
                "source_type": "county_register_of_deeds",
                "state_code": "NC",
                "county_id": surry.id,
                "access_notes": "NC test-county registry placeholder for Phase 2 connector work.",
                "refresh_frequency": "weekly",
            },
        )

        get_or_create(
            session,
            MedianZipValue,
            {"zip_code_id": zip_33558.id, "as_of_date": date(2026, 6, 21), "source_id": census_source.id},
            {"median_home_value": Decimal("520500"), "sample_size": None, "method": "ACS 2024 ZCTA median owner-occupied value"},
        )
        get_or_create(
            session,
            MedianZipValue,
            {"zip_code_id": zip_27030.id, "as_of_date": date(2026, 6, 21), "source_id": census_source.id},
            {"median_home_value": Decimal("165400"), "sample_size": None, "method": "ZipScope seed value from existing app smoke checks"},
        )

        session.commit()


if __name__ == "__main__":
    seed()
    print("Seeded Phase 1 reference data for FL 33558 and NC 27030.")
