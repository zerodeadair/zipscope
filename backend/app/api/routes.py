from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.property import (
    ComparablePropertyMember,
    ComparablePropertySet,
    County,
    DataSource,
    Deed,
    IngestionJob,
    MedianZipValue,
    Owner,
    OwnershipRecord,
    Parcel,
    Property,
    Sale,
    State,
    ZipCode,
    ZipCountyCrosswalk,
)
from app.schemas.property import (
    CountyRead,
    DataSourceCreate,
    DataSourceRead,
    IngestionJobCreate,
    IngestionJobRead,
    MedianComparableRead,
    OwnerPortfolioSummary,
    PropertyTimelineEvent,
    StateRead,
    ZipSummary,
)

router = APIRouter()


@router.get("/states", response_model=list[StateRead])
def list_states(db: Session = Depends(get_db)) -> list[State]:
    return list(db.scalars(select(State).order_by(State.state_code)))


@router.get("/states/{state_code}/counties", response_model=list[CountyRead])
def list_state_counties(state_code: str, db: Session = Depends(get_db)) -> list[County]:
    state = db.scalar(select(State).where(State.state_code == state_code.upper()))
    if not state:
        raise HTTPException(status_code=404, detail="State not found")
    return list(db.scalars(select(County).where(County.state_id == state.id).order_by(County.name)))


@router.get("/counties/{county_id}/summary")
def get_county_summary(county_id: int, db: Session = Depends(get_db)) -> dict:
    county = db.get(County, county_id)
    if not county:
        raise HTTPException(status_code=404, detail="County not found")
    parcel_count = db.scalar(select(func.count()).select_from(Parcel).where(Parcel.county_id == county_id)) or 0
    property_count = (
        db.scalar(select(func.count()).select_from(Property).join(Parcel, Property.parcel_id == Parcel.id).where(Parcel.county_id == county_id))
        or 0
    )
    return {"county": CountyRead.model_validate(county), "parcel_count": parcel_count, "property_count": property_count}


@router.get("/zip/{zip_code}/summary", response_model=ZipSummary)
def get_zip_summary(zip_code: str, db: Session = Depends(get_db)) -> ZipSummary:
    zip_row = db.scalar(select(ZipCode).where(ZipCode.zip_code == zip_code))
    if not zip_row:
        raise HTTPException(status_code=404, detail="ZIP code not found")
    county_names = list(
        db.scalars(
            select(County.name)
            .join(ZipCountyCrosswalk, ZipCountyCrosswalk.county_id == County.id)
            .where(ZipCountyCrosswalk.zip_code_id == zip_row.id)
            .order_by(County.name)
        )
    )
    parcel_count = db.scalar(select(func.count()).select_from(Parcel).where(Parcel.zip_code_id == zip_row.id)) or 0
    median = db.scalar(
        select(MedianZipValue.median_home_value)
        .where(MedianZipValue.zip_code_id == zip_row.id)
        .order_by(desc(MedianZipValue.as_of_date))
        .limit(1)
    )
    return ZipSummary(
        zip_code=zip_row.zip_code,
        primary_city=zip_row.primary_city,
        state_code=zip_row.state_code,
        counties=county_names,
        parcel_count=parcel_count,
        latest_median_home_value=median,
    )


@router.get("/zip/{zip_code}/median-comps", response_model=list[MedianComparableRead])
def get_zip_median_comps(zip_code: str, band_percent: float = 15, db: Session = Depends(get_db)) -> list[MedianComparableRead]:
    zip_row = db.scalar(select(ZipCode).where(ZipCode.zip_code == zip_code))
    if not zip_row:
        raise HTTPException(status_code=404, detail="ZIP code not found")
    comp_set = db.scalar(
        select(ComparablePropertySet)
        .where(ComparablePropertySet.zip_code_id == zip_row.id, ComparablePropertySet.band_percent == band_percent)
        .order_by(desc(ComparablePropertySet.as_of_date))
        .limit(1)
    )
    if not comp_set:
        return []
    members = db.scalars(
        select(ComparablePropertyMember)
        .where(ComparablePropertyMember.comparable_property_set_id == comp_set.id)
        .order_by(ComparablePropertyMember.rank)
    )
    return [
        MedianComparableRead(property_id=member.property_id, rank=member.rank, score=member.score, score_components=member.score_components)
        for member in members
    ]


@router.get("/zip/{zip_code}/owners", response_model=list[OwnerPortfolioSummary])
def get_zip_owners(zip_code: str, db: Session = Depends(get_db)) -> list[OwnerPortfolioSummary]:
    rows = db.execute(
        select(Owner.id, Owner.display_name, Owner.owner_type, func.count(Property.id))
        .join(OwnershipRecord, OwnershipRecord.owner_id == Owner.id)
        .join(Property, Property.id == OwnershipRecord.property_id)
        .join(Parcel, Parcel.id == Property.parcel_id)
        .where(Parcel.zip_code == zip_code)
        .group_by(Owner.id, Owner.display_name, Owner.owner_type)
        .order_by(desc(func.count(Property.id)), Owner.display_name)
        .limit(100)
    )
    return [
        OwnerPortfolioSummary(owner_id=row[0], display_name=row[1], owner_type=row[2], property_count=row[3])
        for row in rows
    ]


@router.get("/property/{property_id}")
def get_property(property_id: int, db: Session = Depends(get_db)) -> dict:
    property_row = db.get(Property, property_id)
    if not property_row:
        raise HTTPException(status_code=404, detail="Property not found")
    parcel = db.get(Parcel, property_row.parcel_id)
    return {"property": property_row, "parcel": parcel}


@router.get("/property/{property_id}/timeline", response_model=list[PropertyTimelineEvent])
def get_property_timeline(property_id: int, db: Session = Depends(get_db)) -> list[PropertyTimelineEvent]:
    if not db.get(Property, property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    deeds = db.scalars(select(Deed).where(Deed.property_id == property_id))
    sales = db.scalars(select(Sale).where(Sale.property_id == property_id))
    events: list[PropertyTimelineEvent] = []
    events.extend(
        PropertyTimelineEvent(
            event_type="deed",
            event_date=str(deed.transfer_date or deed.recorded_date) if (deed.transfer_date or deed.recorded_date) else None,
            amount=deed.transfer_amount,
            label=deed.deed_type or "Recorded deed",
            source_id=deed.source_id,
        )
        for deed in deeds
    )
    events.extend(
        PropertyTimelineEvent(
            event_type="sale",
            event_date=str(sale.sale_date) if sale.sale_date else None,
            amount=sale.sale_price,
            label=sale.qualified or "Recorded sale",
            source_id=sale.source_id,
        )
        for sale in sales
    )
    return sorted(events, key=lambda event: event.event_date or "", reverse=True)


@router.get("/owner/{owner_id}")
def get_owner(owner_id: int, db: Session = Depends(get_db)) -> Owner:
    owner = db.get(Owner, owner_id)
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    return owner


@router.get("/owner/{owner_id}/properties")
def get_owner_properties(owner_id: int, db: Session = Depends(get_db)) -> list[dict]:
    if not db.get(Owner, owner_id):
        raise HTTPException(status_code=404, detail="Owner not found")
    rows = db.execute(
        select(Property, Parcel)
        .join(OwnershipRecord, OwnershipRecord.property_id == Property.id)
        .join(Parcel, Parcel.id == Property.parcel_id)
        .where(OwnershipRecord.owner_id == owner_id)
        .order_by(Parcel.zip_code, Parcel.property_address)
    )
    return [{"property": property_row, "parcel": parcel} for property_row, parcel in rows]


@router.post("/admin/ingestion/jobs", response_model=IngestionJobRead, status_code=status.HTTP_201_CREATED)
def create_ingestion_job(payload: IngestionJobCreate, db: Session = Depends(get_db)) -> IngestionJob:
    job = IngestionJob(**payload.model_dump(), status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/admin/ingestion/jobs/{job_id}", response_model=IngestionJobRead)
def get_ingestion_job(job_id: int, db: Session = Depends(get_db)) -> IngestionJob:
    job = db.get(IngestionJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Ingestion job not found")
    return job


@router.get("/admin/data-sources", response_model=list[DataSourceRead])
def list_data_sources(db: Session = Depends(get_db)) -> list[DataSource]:
    return list(db.scalars(select(DataSource).order_by(DataSource.state_code, DataSource.name)))


@router.post("/admin/data-sources", response_model=DataSourceRead, status_code=status.HTTP_201_CREATED)
def create_data_source(payload: DataSourceCreate, db: Session = Depends(get_db)) -> DataSource:
    source = DataSource(**payload.model_dump())
    db.add(source)
    db.commit()
    db.refresh(source)
    return source
