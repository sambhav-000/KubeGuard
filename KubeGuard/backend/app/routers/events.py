"""Events read-only endpoint."""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from kubernetes.client.exceptions import ApiException

from app.core.k8s_client import k8s_manager
from app.models.schemas import EventListResponse, EventItem, ErrorResponse

logger = logging.getLogger("kubeguard.events")
router = APIRouter(prefix="/events", tags=["Events"])


@router.get(
    "",
    response_model=EventListResponse,
    summary="List recent Kubernetes cluster events",
    responses={500: {"model": ErrorResponse}},
)
def get_events(
    namespace: Optional[str] = Query(
        None, description="Optional namespace filter"
    ),
    limit: int = Query(50, ge=1, le=200, description="Max number of events"),
):
    """Returns recent events from the connected Kubernetes cluster."""
    try:
        if namespace:
            event_list = k8s_manager.core_v1.list_namespaced_event(
                namespace=namespace
            ).items
        else:
            event_list = k8s_manager.core_v1.list_event_for_all_namespaces().items

        # Sort by last timestamp descending
        event_list = sorted(
            event_list,
            key=lambda e: e.last_timestamp or e.metadata.creation_timestamp,
            reverse=True,
        )[:limit]

        items: List[EventItem] = []
        for evt in event_list:
            obj_name = ""
            if evt.involved_object:
                obj_name = f"{evt.involved_object.kind}/{evt.involved_object.name}"

            ts = (
                evt.last_timestamp.isoformat()
                if evt.last_timestamp
                else (
                    evt.metadata.creation_timestamp.isoformat()
                    if evt.metadata.creation_timestamp
                    else "unknown"
                )
            )

            items.append(
                EventItem(
                    type=evt.type or "Normal",
                    reason=evt.reason or "Unknown",
                    message=evt.message or "",
                    object=obj_name,
                    namespace=evt.metadata.namespace,
                    count=evt.count or 1,
                    last_timestamp=ts,
                )
            )

        return EventListResponse(total=len(items), items=items)

    except ApiException as e:
        logger.error(f"Kubernetes API error fetching events: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Kubernetes API error: {e.reason} (HTTP {e.status})",
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching events: {e}")
        raise HTTPException(status_code=500, detail=str(e))

