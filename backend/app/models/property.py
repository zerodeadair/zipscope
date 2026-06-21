from datetime import date, datetime
from decimal import Decimal

from geoalchemy2 import Geometry
from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Index, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class State(Base, TimestampMixin):
    __tablename__ = "states"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    state_code: Mapped[str] = mapped_column(String(2), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    fips_code: Mapped[str | None] = mapped_column(String(2), unique=True)

    counties: Mapped[list["County"]] = relationship(back_populates="state")


class County(Base, TimestampMixin):
    __tablename__ = "counties"
    __table_args__ = (
        UniqueConstraint("state_id", "fips_code", name="uq_counties_state_fips"),
        Index("ix_counties_state_name", "state_id", "name"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    fips_code: Mapped[str] = mapped_column(String(5), nullable=False)
    county_seat: Mapped[str | None] = mapped_column(String(120))
    geometry: Mapped[object | None] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))

    state: Mapped["State"] = relationship(back_populates="counties")


class City(Base, TimestampMixin):
    __tablename__ = "cities"
    __table_args__ = (
        UniqueConstraint("state_id", "name", "county_id", name="uq_cities_state_county_name"),
        Index("ix_cities_state_name", "state_id", "name"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"), nullable=False)
    county_id: Mapped[int | None] = mapped_column(ForeignKey("counties.id"))
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    municipality_type: Mapped[str | None] = mapped_column(String(80))
    geometry: Mapped[object | None] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))


class ZipCode(Base, TimestampMixin):
    __tablename__ = "zip_codes"
    __table_args__ = (
        UniqueConstraint("zip_code", name="uq_zip_codes_zip"),
        Index("ix_zip_codes_centroid", "centroid", postgresql_using="gist"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    zip_code: Mapped[str] = mapped_column(String(5), nullable=False, index=True)
    primary_city: Mapped[str | None] = mapped_column(String(160))
    state_code: Mapped[str] = mapped_column(String(2), nullable=False, index=True)
    centroid: Mapped[object | None] = mapped_column(Geometry("POINT", srid=4326))
    geometry: Mapped[object | None] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))


class ZipCountyCrosswalk(Base, TimestampMixin):
    __tablename__ = "zip_county_crosswalks"
    __table_args__ = (
        UniqueConstraint("zip_code_id", "county_id", name="uq_zip_county_crosswalk"),
        Index("ix_zip_county_zip_county", "zip_code_id", "county_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    zip_code_id: Mapped[int] = mapped_column(ForeignKey("zip_codes.id"), nullable=False)
    county_id: Mapped[int] = mapped_column(ForeignKey("counties.id"), nullable=False)
    residential_ratio: Mapped[Decimal | None] = mapped_column(Numeric(8, 6))
    land_area_ratio: Mapped[Decimal | None] = mapped_column(Numeric(8, 6))
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class CensusTract(Base, TimestampMixin):
    __tablename__ = "census_tracts"
    __table_args__ = (
        UniqueConstraint("geoid", name="uq_census_tracts_geoid"),
        Index("ix_census_tracts_geometry", "geometry", postgresql_using="gist"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"), nullable=False)
    county_id: Mapped[int] = mapped_column(ForeignKey("counties.id"), nullable=False)
    geoid: Mapped[str] = mapped_column(String(16), nullable=False)
    tract_code: Mapped[str] = mapped_column(String(12), nullable=False)
    block_group: Mapped[str | None] = mapped_column(String(12))
    geometry: Mapped[object | None] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))


class DataSource(Base, TimestampMixin):
    __tablename__ = "data_sources"
    __table_args__ = (
        UniqueConstraint("name", "jurisdiction_type", "jurisdiction_id", name="uq_data_sources_jurisdiction"),
        Index("ix_data_sources_state_county", "state_code", "county_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    source_type: Mapped[str] = mapped_column(String(80), nullable=False)
    jurisdiction_type: Mapped[str] = mapped_column(String(40), nullable=False)
    jurisdiction_id: Mapped[int | None] = mapped_column(BigInteger)
    state_code: Mapped[str | None] = mapped_column(String(2), index=True)
    county_id: Mapped[int | None] = mapped_column(ForeignKey("counties.id"))
    base_url: Mapped[str | None] = mapped_column(Text)
    terms_url: Mapped[str | None] = mapped_column(Text)
    robots_url: Mapped[str | None] = mapped_column(Text)
    access_notes: Mapped[str | None] = mapped_column(Text)
    refresh_frequency: Mapped[str | None] = mapped_column(String(80))
    enabled: Mapped[int] = mapped_column(Integer, default=1, nullable=False)


class SourceField(Base, TimestampMixin):
    __tablename__ = "source_fields"
    __table_args__ = (
        UniqueConstraint("data_source_id", "source_field_name", name="uq_source_fields_source_name"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    data_source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"), nullable=False)
    source_field_name: Mapped[str] = mapped_column(String(180), nullable=False)
    canonical_table: Mapped[str | None] = mapped_column(String(120))
    canonical_field: Mapped[str | None] = mapped_column(String(120))
    transform_notes: Mapped[str | None] = mapped_column(Text)


class IngestionJob(Base, TimestampMixin):
    __tablename__ = "ingestion_jobs"
    __table_args__ = (
        Index("ix_ingestion_jobs_status", "status"),
        Index("ix_ingestion_jobs_source_status", "data_source_id", "status"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    data_source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    connector_name: Mapped[str] = mapped_column(String(160), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="pending")
    requested_by: Mapped[str | None] = mapped_column(String(160))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    records_seen: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_inserted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_updated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_failed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    parameters: Mapped[dict | None] = mapped_column(JSONB)


class IngestionJobLog(Base, TimestampMixin):
    __tablename__ = "ingestion_job_logs"
    __table_args__ = (Index("ix_ingestion_job_logs_job_level", "ingestion_job_id", "level"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    ingestion_job_id: Mapped[int] = mapped_column(ForeignKey("ingestion_jobs.id"), nullable=False)
    level: Mapped[str] = mapped_column(String(20), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSONB)


class RawSourcePayload(Base, TimestampMixin):
    __tablename__ = "raw_source_payloads"
    __table_args__ = (
        Index("ix_raw_source_payloads_source_external", "data_source_id", "external_id"),
        Index("ix_raw_source_payloads_job", "ingestion_job_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    data_source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"), nullable=False)
    ingestion_job_id: Mapped[int | None] = mapped_column(ForeignKey("ingestion_jobs.id"))
    external_id: Mapped[str | None] = mapped_column(String(220))
    source_url: Mapped[str | None] = mapped_column(Text)
    payload_type: Mapped[str] = mapped_column(String(40), nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSONB)
    content_hash: Mapped[str | None] = mapped_column(String(128), index=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Parcel(Base, TimestampMixin):
    __tablename__ = "parcels"
    __table_args__ = (
        UniqueConstraint("county_id", "parcel_number", name="uq_parcels_county_parcel_number"),
        Index("ix_parcels_state_county", "state_id", "county_id"),
        Index("ix_parcels_zip", "zip_code"),
        Index("ix_parcels_owner_name", "current_owner_name"),
        Index("ix_parcels_geometry", "centroid", postgresql_using="gist"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"), nullable=False)
    county_id: Mapped[int] = mapped_column(ForeignKey("counties.id"), nullable=False)
    zip_code_id: Mapped[int | None] = mapped_column(ForeignKey("zip_codes.id"))
    parcel_number: Mapped[str] = mapped_column(String(120), nullable=False)
    apn: Mapped[str | None] = mapped_column(String(120), index=True)
    folio_number: Mapped[str | None] = mapped_column(String(120), index=True)
    pin: Mapped[str | None] = mapped_column(String(160), index=True)
    property_address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(160), index=True)
    zip_code: Mapped[str | None] = mapped_column(String(5), index=True)
    current_owner_name: Mapped[str | None] = mapped_column(Text)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    source_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    centroid: Mapped[object | None] = mapped_column(Geometry("POINT", srid=4326))


class Property(Base, TimestampMixin):
    __tablename__ = "properties"
    __table_args__ = (
        Index("ix_properties_type_land_use", "property_type", "land_use_code"),
        Index("ix_properties_value", "market_value", "assessed_value"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    parcel_id: Mapped[int] = mapped_column(ForeignKey("parcels.id"), nullable=False, index=True)
    property_type: Mapped[str | None] = mapped_column(String(120), index=True)
    land_use_code: Mapped[str | None] = mapped_column(String(80), index=True)
    land_use_description: Mapped[str | None] = mapped_column(String(220))
    year_built: Mapped[int | None] = mapped_column(Integer)
    bedrooms: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    bathrooms: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    square_feet: Mapped[int | None] = mapped_column(Integer)
    gross_square_feet: Mapped[int | None] = mapped_column(Integer)
    lot_size_square_feet: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    lot_size_acres: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    market_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), index=True)
    assessed_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), index=True)
    taxable_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    flood_zone: Mapped[str | None] = mapped_column(String(120))
    school_district: Mapped[str | None] = mapped_column(String(220))
    hoa_name: Mapped[str | None] = mapped_column(String(220))
    cdd_or_special_district: Mapped[str | None] = mapped_column(String(220))


class PropertyAddress(Base, TimestampMixin):
    __tablename__ = "property_addresses"
    __table_args__ = (
        Index("ix_property_addresses_search", "street_number", "street_name", "city", "zip_code"),
        Index("ix_property_addresses_location", "location", postgresql_using="gist"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    full_address: Mapped[str] = mapped_column(Text, nullable=False)
    street_number: Mapped[str | None] = mapped_column(String(40))
    street_name: Mapped[str | None] = mapped_column(String(220), index=True)
    unit: Mapped[str | None] = mapped_column(String(80))
    city: Mapped[str | None] = mapped_column(String(160), index=True)
    state_code: Mapped[str] = mapped_column(String(2), nullable=False)
    zip_code: Mapped[str | None] = mapped_column(String(5), index=True)
    location: Mapped[object | None] = mapped_column(Geometry("POINT", srid=4326))
    is_primary: Mapped[int] = mapped_column(Integer, default=1, nullable=False)


class Owner(Base, TimestampMixin):
    __tablename__ = "owners"
    __table_args__ = (
        Index("ix_owners_classification", "owner_type", "institutional_owner"),
        Index("ix_owners_name", "display_name"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    display_name: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_name: Mapped[str] = mapped_column(Text, nullable=False)
    owner_type: Mapped[str] = mapped_column(String(80), nullable=False, default="unknown")
    institutional_owner: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    private_equity_owner: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    government_owner: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    nonprofit_owner: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    classification_confidence: Mapped[Decimal | None] = mapped_column(Numeric(5, 4))


class OwnerAlias(Base, TimestampMixin):
    __tablename__ = "owner_aliases"
    __table_args__ = (UniqueConstraint("owner_id", "alias", name="uq_owner_alias"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("owners.id"), nullable=False, index=True)
    alias: Mapped[str] = mapped_column(Text, nullable=False)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class OwnerMailingAddress(Base, TimestampMixin):
    __tablename__ = "owner_mailing_addresses"
    __table_args__ = (
        Index("ix_owner_mailing_addresses_search", "city", "state_code", "zip_code"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("owners.id"), nullable=False, index=True)
    full_address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str | None] = mapped_column(String(160), index=True)
    state_code: Mapped[str | None] = mapped_column(String(2), index=True)
    zip_code: Mapped[str | None] = mapped_column(String(10), index=True)
    country: Mapped[str | None] = mapped_column(String(80))
    is_current: Mapped[int] = mapped_column(Integer, default=1, nullable=False)


class OwnershipRecord(Base, TimestampMixin):
    __tablename__ = "ownership_records"
    __table_args__ = (
        Index("ix_ownership_records_property_current", "property_id", "is_current"),
        Index("ix_ownership_records_owner_current", "owner_id", "is_current"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("owners.id"), nullable=False)
    owner_mailing_address_id: Mapped[int | None] = mapped_column(ForeignKey("owner_mailing_addresses.id"))
    ownership_start_date: Mapped[date | None] = mapped_column(Date)
    ownership_end_date: Mapped[date | None] = mapped_column(Date)
    is_current: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    owner_occupied_inferred: Mapped[int | None] = mapped_column(Integer)
    absentee_owner_inferred: Mapped[int | None] = mapped_column(Integer)
    inference_method: Mapped[str | None] = mapped_column(Text)
    confidence_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 4))


class Assessment(Base, TimestampMixin):
    __tablename__ = "assessments"
    __table_args__ = (
        UniqueConstraint("property_id", "tax_year", "source_id", name="uq_assessments_property_year_source"),
        Index("ix_assessments_values", "market_value", "assessed_value", "taxable_value"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    tax_year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    market_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), index=True)
    assessed_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), index=True)
    taxable_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    land_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    building_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    extra_feature_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class TaxBill(Base, TimestampMixin):
    __tablename__ = "tax_bills"
    __table_args__ = (
        UniqueConstraint("property_id", "tax_year", "bill_number", name="uq_tax_bills_property_year_bill"),
        Index("ix_tax_bills_due_status", "due_date", "status"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    tax_year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    bill_number: Mapped[str | None] = mapped_column(String(120))
    annual_property_taxes: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    non_ad_valorem_taxes: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    total_due: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    due_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str | None] = mapped_column(String(80), index=True)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class TaxPayment(Base, TimestampMixin):
    __tablename__ = "tax_payments"
    __table_args__ = (Index("ix_tax_payments_paid_date", "paid_date"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tax_bill_id: Mapped[int] = mapped_column(ForeignKey("tax_bills.id"), nullable=False, index=True)
    paid_date: Mapped[date | None] = mapped_column(Date, index=True)
    amount_paid: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    receipt_number: Mapped[str | None] = mapped_column(String(120))
    payment_status: Mapped[str | None] = mapped_column(String(80))


class Exemption(Base, TimestampMixin):
    __tablename__ = "exemptions"
    __table_args__ = (Index("ix_exemptions_property_year_type", "property_id", "tax_year", "exemption_type"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    tax_year: Mapped[int | None] = mapped_column(Integer)
    exemption_type: Mapped[str] = mapped_column(String(120), nullable=False)
    exemption_amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    homestead_status: Mapped[int | None] = mapped_column(Integer)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class Deed(Base, TimestampMixin):
    __tablename__ = "deeds"
    __table_args__ = (
        Index("ix_deeds_property_recorded", "property_id", "recorded_date"),
        Index("ix_deeds_instrument", "instrument_number"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    instrument_number: Mapped[str | None] = mapped_column(String(160), index=True)
    book: Mapped[str | None] = mapped_column(String(80))
    page: Mapped[str | None] = mapped_column(String(80))
    deed_type: Mapped[str | None] = mapped_column(String(120))
    recorded_date: Mapped[date | None] = mapped_column(Date, index=True)
    transfer_date: Mapped[date | None] = mapped_column(Date, index=True)
    grantor: Mapped[str | None] = mapped_column(Text)
    grantee: Mapped[str | None] = mapped_column(Text)
    transfer_amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    source_url: Mapped[str | None] = mapped_column(Text)


class Sale(Base, TimestampMixin):
    __tablename__ = "sales"
    __table_args__ = (
        Index("ix_sales_property_sale_date", "property_id", "sale_date"),
        Index("ix_sales_price_date", "sale_price", "sale_date"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    deed_id: Mapped[int | None] = mapped_column(ForeignKey("deeds.id"))
    sale_date: Mapped[date | None] = mapped_column(Date, index=True)
    sale_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), index=True)
    qualified: Mapped[str | None] = mapped_column(String(80))
    vacant_or_improved: Mapped[str | None] = mapped_column(String(80))
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class Mortgage(Base, TimestampMixin):
    __tablename__ = "mortgages"
    __table_args__ = (Index("ix_mortgages_property_recorded", "property_id", "recorded_date"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    instrument_number: Mapped[str | None] = mapped_column(String(160), index=True)
    lender: Mapped[str | None] = mapped_column(Text)
    borrower: Mapped[str | None] = mapped_column(Text)
    amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    recorded_date: Mapped[date | None] = mapped_column(Date)
    maturity_date: Mapped[date | None] = mapped_column(Date)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class Lien(Base, TimestampMixin):
    __tablename__ = "liens"
    __table_args__ = (Index("ix_liens_property_status", "property_id", "status"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    lien_type: Mapped[str | None] = mapped_column(String(120))
    instrument_number: Mapped[str | None] = mapped_column(String(160), index=True)
    amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    recorded_date: Mapped[date | None] = mapped_column(Date)
    released_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str | None] = mapped_column(String(80))
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class Permit(Base, TimestampMixin):
    __tablename__ = "permits"
    __table_args__ = (Index("ix_permits_property_issue_date", "property_id", "issue_date"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    permit_number: Mapped[str | None] = mapped_column(String(160), index=True)
    permit_type: Mapped[str | None] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text)
    issue_date: Mapped[date | None] = mapped_column(Date)
    final_date: Mapped[date | None] = mapped_column(Date)
    estimated_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    status: Mapped[str | None] = mapped_column(String(80))
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class CodeViolation(Base, TimestampMixin):
    __tablename__ = "code_violations"
    __table_args__ = (Index("ix_code_violations_property_status", "property_id", "status"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    case_number: Mapped[str | None] = mapped_column(String(160), index=True)
    violation_type: Mapped[str | None] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text)
    opened_date: Mapped[date | None] = mapped_column(Date)
    closed_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str | None] = mapped_column(String(80))
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class RentalRegistration(Base, TimestampMixin):
    __tablename__ = "rental_registrations"
    __table_args__ = (Index("ix_rental_registrations_property_status", "property_id", "status"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    registration_number: Mapped[str | None] = mapped_column(String(160), index=True)
    status: Mapped[str | None] = mapped_column(String(80))
    effective_date: Mapped[date | None] = mapped_column(Date)
    expiration_date: Mapped[date | None] = mapped_column(Date)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class ShortTermRentalPermit(Base, TimestampMixin):
    __tablename__ = "short_term_rental_permits"
    __table_args__ = (Index("ix_str_permits_property_status", "property_id", "status"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    permit_number: Mapped[str | None] = mapped_column(String(160), index=True)
    platform: Mapped[str | None] = mapped_column(String(120))
    status: Mapped[str | None] = mapped_column(String(80))
    issue_date: Mapped[date | None] = mapped_column(Date)
    expiration_date: Mapped[date | None] = mapped_column(Date)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class ParcelGeometry(Base, TimestampMixin):
    __tablename__ = "parcel_geometries"
    __table_args__ = (
        UniqueConstraint("parcel_id", "source_id", name="uq_parcel_geometries_parcel_source"),
        Index("ix_parcel_geometries_geom", "geometry", postgresql_using="gist"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    parcel_id: Mapped[int] = mapped_column(ForeignKey("parcels.id"), nullable=False)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    geometry: Mapped[object] = mapped_column(Geometry("MULTIPOLYGON", srid=4326), nullable=False)
    centroid: Mapped[object | None] = mapped_column(Geometry("POINT", srid=4326))
    geometry_area_sq_m: Mapped[Decimal | None] = mapped_column(Numeric(18, 4))


class ValuationEstimate(Base, TimestampMixin):
    __tablename__ = "valuation_estimates"
    __table_args__ = (
        Index("ix_valuation_estimates_property_model", "property_id", "model_name"),
        Index("ix_valuation_estimates_value", "estimated_value"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    model_name: Mapped[str] = mapped_column(String(160), nullable=False)
    estimated_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    low_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    high_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    confidence_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 4))
    estimate_date: Mapped[date] = mapped_column(Date, nullable=False)


class MedianZipValue(Base, TimestampMixin):
    __tablename__ = "median_zip_values"
    __table_args__ = (
        UniqueConstraint("zip_code_id", "as_of_date", "source_id", name="uq_median_zip_values_zip_date_source"),
        Index("ix_median_zip_values_zip_value", "zip_code_id", "median_home_value"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    zip_code_id: Mapped[int] = mapped_column(ForeignKey("zip_codes.id"), nullable=False)
    as_of_date: Mapped[date] = mapped_column(Date, nullable=False)
    median_home_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    sample_size: Mapped[int | None] = mapped_column(Integer)
    method: Mapped[str | None] = mapped_column(Text)


class ComparablePropertySet(Base, TimestampMixin):
    __tablename__ = "comparable_property_sets"
    __table_args__ = (
        UniqueConstraint("zip_code_id", "band_percent", "as_of_date", name="uq_comp_sets_zip_band_date"),
        Index("ix_comp_sets_zip_band", "zip_code_id", "band_percent"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    zip_code_id: Mapped[int] = mapped_column(ForeignKey("zip_codes.id"), nullable=False)
    median_zip_value_id: Mapped[int | None] = mapped_column(ForeignKey("median_zip_values.id"))
    band_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    as_of_date: Mapped[date] = mapped_column(Date, nullable=False)
    ranking_version: Mapped[str] = mapped_column(String(80), nullable=False, default="v1")
    criteria: Mapped[dict | None] = mapped_column(JSONB)


class ComparablePropertyMember(Base, TimestampMixin):
    __tablename__ = "comparable_property_members"
    __table_args__ = (
        UniqueConstraint("comparable_property_set_id", "property_id", name="uq_comp_members_set_property"),
        Index("ix_comp_members_rank", "comparable_property_set_id", "rank"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    comparable_property_set_id: Mapped[int] = mapped_column(ForeignKey("comparable_property_sets.id"), nullable=False)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    score: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False)
    score_components: Mapped[dict | None] = mapped_column(JSONB)


class ConfidenceScore(Base, TimestampMixin):
    __tablename__ = "confidence_scores"
    __table_args__ = (
        Index("ix_confidence_scores_entity", "entity_table", "entity_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    entity_table: Mapped[str] = mapped_column(String(120), nullable=False)
    entity_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    score_type: Mapped[str] = mapped_column(String(120), nullable=False)
    score: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    method: Mapped[str | None] = mapped_column(Text)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_entity", "entity_table", "entity_id"),
        Index("ix_audit_logs_actor", "actor"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    actor: Mapped[str | None] = mapped_column(String(160))
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    entity_table: Mapped[str | None] = mapped_column(String(120))
    entity_id: Mapped[int | None] = mapped_column(BigInteger)
    before: Mapped[dict | None] = mapped_column(JSONB)
    after: Mapped[dict | None] = mapped_column(JSONB)
    reason: Mapped[str | None] = mapped_column(Text)
