from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class StateRead(BaseModel):
    id: int
    state_code: str
    name: str
    fips_code: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CountyRead(BaseModel):
    id: int
    state_id: int
    name: str
    fips_code: str
    county_seat: str | None = None

    model_config = ConfigDict(from_attributes=True)


class DataSourceCreate(BaseModel):
    name: str
    source_type: str
    jurisdiction_type: str
    jurisdiction_id: int | None = None
    state_code: str | None = None
    county_id: int | None = None
    base_url: str | None = None
    terms_url: str | None = None
    robots_url: str | None = None
    access_notes: str | None = None
    refresh_frequency: str | None = None


class DataSourceRead(DataSourceCreate):
    id: int
    enabled: int

    model_config = ConfigDict(from_attributes=True)


class IngestionJobCreate(BaseModel):
    data_source_id: int | None = None
    connector_name: str
    requested_by: str | None = None
    parameters: dict | None = None


class IngestionJobRead(BaseModel):
    id: int
    data_source_id: int | None = None
    connector_name: str
    status: str
    requested_by: str | None = None
    started_at: datetime | None = None
    finished_at: datetime | None = None
    records_seen: int
    records_inserted: int
    records_updated: int
    records_failed: int
    parameters: dict | None = None

    model_config = ConfigDict(from_attributes=True)


class SummaryMetric(BaseModel):
    key: str
    value: int | Decimal | str | None


class ZipSummary(BaseModel):
    zip_code: str
    primary_city: str | None = None
    state_code: str
    counties: list[str]
    parcel_count: int
    latest_median_home_value: Decimal | None = None


class MedianComparableRead(BaseModel):
    property_id: int
    rank: int
    score: Decimal
    score_components: dict | None = None


class OwnerPortfolioSummary(BaseModel):
    owner_id: int
    display_name: str
    owner_type: str
    property_count: int


class PropertyTimelineEvent(BaseModel):
    event_type: str
    event_date: str | None
    amount: Decimal | None = None
    label: str
    source_id: int | None = None
