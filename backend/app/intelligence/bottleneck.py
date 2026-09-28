from typing import List
from app.core.constants import BottleneckSeverity
from app.db.models import Bottleneck, ProcurementCentre


def detect_centre_bottlenecks(centre: ProcurementCentre, queue_length: int) -> List[dict]:
    """Detects counter throughput anomalies and generates recommended actions."""
    bottlenecks = []
    active_counters = max(centre.active_counters, 1)
    queue_per_counter = queue_length / active_counters

    # Threshold 1: Heavy queue with idle/closed counters
    if queue_per_counter > 15 and centre.active_counters < centre.total_counters:
        bottlenecks.append({
            "counter": centre.active_counters + 1,
            "processing_time_above_normal": int(min(60, queue_per_counter * 3)),
            "expected_delay": int(round(queue_per_counter * 1.5)),
            "recommended_action": f"Activate standby Counter #{centre.active_counters + 1} to reduce queue by 35%",
            "severity": BottleneckSeverity.CRITICAL if queue_per_counter > 25 else BottleneckSeverity.WARNING,
        })

    # Threshold 2: Slow average processing time drag
    if centre.avg_processing_time_minutes > 8.0:
        bottlenecks.append({
            "counter": 1,
            "processing_time_above_normal": int(((centre.avg_processing_time_minutes - 6.0) / 6.0) * 100),
            "expected_delay": int(round((centre.avg_processing_time_minutes - 6.0) * queue_length / active_counters)),
            "recommended_action": "Recalibrate weighbridge moisture meter & deploy digital scale assistant",
            "severity": BottleneckSeverity.CRITICAL if centre.avg_processing_time_minutes > 10.0 else BottleneckSeverity.WARNING,
        })

    return bottlenecks
