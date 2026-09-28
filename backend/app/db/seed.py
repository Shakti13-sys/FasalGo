from sqlalchemy.orm import Session

from app.core.constants import (
    BottleneckSeverity,
    OperationalStatus,
    PaymentStatusEnum,
    ProcurementStageEnum,
    TokenStatus,
    UserRole,
)
from app.core.security import get_password_hash
from app.db.models import (
    Bottleneck,
    FarmerProfile,
    Notification,
    Payment,
    Procurement,
    ProcurementCentre,
    ProcurementStage,
    Slot,
    Token,
    User,
)


def seed_database(db: Session) -> None:
    # 1. Seed Procurement Centres with Real-World APMC Mandis if none exist
    if db.query(ProcurementCentre).count() == 0:
        centres = [
            ProcurementCentre(
                id="c1",
                name="Jaipur APMC (Muhana Mandi Yard)",
                code="RAJ-JPR-01",
                latitude=26.8340,
                longitude=75.7620,
                active_counters=3,
                total_counters=4,
                avg_processing_time_minutes=6.0,
                capacity=50,
                processing_speed=30,
                operational_status=OperationalStatus.OPEN,
                address="Muhana Mandi Terminal, Sanganer, Jaipur, Rajasthan 302029",
            ),
            ProcurementCentre(
                id="c2",
                name="Chomu Krishi Upaj Mandi Samiti",
                code="RAJ-CHM-02",
                latitude=27.1718,
                longitude=75.7226,
                active_counters=2,
                total_counters=3,
                avg_processing_time_minutes=8.0,
                capacity=40,
                processing_speed=22,
                operational_status=OperationalStatus.OPEN,
                address="Mandi Yard, NH-52 Sikar Road, Chomu, Rajasthan 303702",
            ),
            ProcurementCentre(
                id="c3",
                name="Dausa APMC Grain Market",
                code="RAJ-DSA-03",
                latitude=26.8920,
                longitude=76.3380,
                active_counters=1,
                total_counters=3,
                avg_processing_time_minutes=11.0,
                capacity=35,
                processing_speed=16,
                operational_status=OperationalStatus.OPEN,
                address="Agra Road Mandi Samiti, Dausa, Rajasthan 303303",
            ),
            ProcurementCentre(
                id="c4",
                name="Kishangarh Grain Mandi Yard",
                code="RAJ-KSH-04",
                latitude=26.5744,
                longitude=74.8624,
                active_counters=4,
                total_counters=4,
                avg_processing_time_minutes=4.5,
                capacity=60,
                processing_speed=45,
                operational_status=OperationalStatus.OPEN,
                address="Mandi Parishad, Kishangarh, Ajmer, Rajasthan 305801",
            ),
            ProcurementCentre(
                id="c5",
                name="Bagru Grain & Oilseed Hub",
                code="RAJ-BGR-05",
                latitude=26.8122,
                longitude=75.5458,
                active_counters=2,
                total_counters=4,
                avg_processing_time_minutes=7.0,
                capacity=45,
                processing_speed=25,
                operational_status=OperationalStatus.OPEN,
                address="Ajmer Expressway, Bagru, Jaipur, Rajasthan 303007",
            ),
        ]
        db.add_all(centres)
        db.commit()

    # 2. Seed Default Slots for all centres
    if db.query(Slot).count() == 0:
        centres = db.query(ProcurementCentre).all()
        dates = ["Today", "Tomorrow", "14 Sep", "15 Sep"]
        time_slots = [
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
            "4:00 PM",
            "4:30 PM",
        ]
        slots = []
        for centre in centres:
            for d in dates:
                for t in time_slots:
                    slot_id = f"slot-{centre.id}-{d.lower().replace(' ', '')}-{t.lower().replace(' ', '').replace(':', '')}"
                    slots.append(
                        Slot(
                            id=slot_id,
                            centre_id=centre.id,
                            date=d,
                            time_label=t,
                            capacity=20,
                            booked_count=1 if (centre.id == "c1" and d == "Today" and t == "10:00 AM") else 0,
                            is_available=True,
                        )
                    )
        db.add_all(slots)
        db.commit()

    # 3. Seed Real Farmer & Admin Users
    farmer_user = db.query(User).filter(User.mobile == "9876543210").first()
    if not farmer_user:
        farmer_user = User(
            name="Rajesh Patel",
            mobile="9876543210",
            email="rajesh.patel@fasalgo.in",
            password_hash=get_password_hash("farmer123"),
            role=UserRole.FARMER,
            is_active=True,
        )
        db.add(farmer_user)
        db.commit()
        db.refresh(farmer_user)

        profile = FarmerProfile(
            user_id=farmer_user.id,
            crop="Wheat (Sharbati Grade A)",
            quantity=85.0,
            state="Rajasthan",
            district="Jaipur",
            location="Muhana Village, Sanganer",
            latitude=26.8340,
            longitude=75.7620,
        )
        db.add(profile)
        db.commit()

    admin_user = db.query(User).filter((User.mobile == "9999999999") | (User.email == "admin@fasalgo.gov.in") | (User.email == "admin@fasalgo.in")).first()
    if not admin_user:
        admin_user = User(
            name="Govt Procurement Officer (Jaipur Mandi)",
            mobile="9999999999",
            email="admin@fasalgo.gov.in",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin_user)
        db.commit()

    # 4. Seed Active Token
    if db.query(Token).count() == 0 and farmer_user:
        token = Token(
            id="t-init-47",
            token_number=47,
            token_code="#47",
            centre_id="c1",
            slot_id="slot-c1-today-1000am",
            user_id=farmer_user.id,
            crop="Wheat (Sharbati Grade A)",
            quantity=85.0,
            status=TokenStatus.IN_QUEUE,
            date="Today",
            time="10:00 AM",
            booked_at_eta_minutes=25.0,
        )
        db.add(token)
        db.commit()

    # 5. Seed Active Procurement & Stages with Real MSP Calculation (85 Qtl * ₹2,275/Qtl = ₹1,93,375)
    if db.query(Procurement).count() == 0 and farmer_user:
        procurement = Procurement(
            id="prc-init-0891",
            procurement_id="PRC-2026-0891",
            token_id="t-init-47",
            user_id=farmer_user.id,
            centre_id="c1",
            crop="Wheat (Sharbati Grade A)",
            quantity=85.0,
            unit="Quintal",
            rate_per_unit=2275.0,  # Official MSP Rate
            amount=193375.0,
            status=ProcurementStageEnum.BOOKED,
            date="Today",
        )
        db.add(procurement)
        db.commit()

        stages_data = [
            (ProcurementStageEnum.BOOKED, "Slot Booked", "Token #47 allocated for Jaipur APMC (Muhana)", "9:30 AM", True, 0),
            (ProcurementStageEnum.ARRIVED, "Gate Entry Check-in", "Vehicle position recorded at Mandi Entry Gate #2", "10:15 AM", True, 1),
            (ProcurementStageEnum.WEIGHING, "Weighbridge Weighment", "Awaiting turn at Electronic Weighbridge #3", "Pending Turn", False, 2),
            (ProcurementStageEnum.QUALITY_CHECK, "Quality Assay Certification", "Moisture and foreign matter lab analysis", "Pending Weighment", False, 3),
            (ProcurementStageEnum.ACCEPTED, "Procurement Receipt Issued", "Official MSP receipt generation", "Pending Quality", False, 4),
            (ProcurementStageEnum.PROCURED, "Warehouse Silo Unloading", "Stock transfer to CWC Silo Bay #4", "Pending Receipt", False, 5),
            (ProcurementStageEnum.PAYMENT_PENDING, "DBT Payment Processing", "PFMS Direct Benefit Transfer initiation", "Pending Unloading", False, 6),
            (ProcurementStageEnum.PAID, "Payment Disbursed via DBT", "₹1,93,375.00 credit to Bank A/C •••• 4821", "Pending Clearance", False, 7),
        ]

        for stage_enum, label, desc, time_str, completed, order_idx in stages_data:
            stage_obj = ProcurementStage(
                procurement_id=procurement.id,
                stage=stage_enum,
                label=label,
                description=desc,
                timestamp=time_str,
                completed=completed,
                order_idx=order_idx,
            )
            db.add(stage_obj)
        db.commit()

        payment = Payment(
            id="pay-init-01",
            procurement_id=procurement.id,
            user_id=farmer_user.id,
            crop="Wheat (Sharbati Grade A)",
            quantity=85.0,
            amount=193375.0,
            status=PaymentStatusEnum.PENDING,
            date="Today (Awaiting Weighment & Assay)",
            transaction_ref="PFMS-PAY-INIT-0891",
            bank_account_hint="•••• 4821 (State Bank of India)",
        )
        db.add(payment)
        db.commit()

    # 6. Seed Bottlenecks for Admin Command Center
    if db.query(Bottleneck).count() == 0:
        bottlenecks = [
            Bottleneck(
                id="b1",
                centre_id="c3",
                counter=2,
                processing_time_above_normal=45,
                expected_delay=25,
                recommended_action="Open auxiliary weighbridge counter & deploy additional assaying staff at Dausa APMC",
                severity=BottleneckSeverity.CRITICAL,
                is_active=True,
            ),
            Bottleneck(
                id="b2",
                centre_id="c2",
                counter=1,
                processing_time_above_normal=25,
                expected_delay=12,
                recommended_action="Recalibrate digital moisture meter scale at Chomu Mandi",
                severity=BottleneckSeverity.WARNING,
                is_active=True,
            ),
        ]
        db.add_all(bottlenecks)
        db.commit()

    # 7. Seed Initial Notifications
    if db.query(Notification).count() == 0 and farmer_user:
        notifications = [
            Notification(
                id="n1",
                user_id=farmer_user.id,
                type="turn",
                title="Turn Approaching Alert",
                message="Your token #47 is 4 turns away at Jaipur APMC (Muhana). Please position your vehicle near Counter #3.",
                timestamp="10 min ago",
                read=False,
            ),
            Notification(
                id="n2",
                user_id=farmer_user.id,
                type="payment",
                title="DBT Payment Credited",
                message="₹1,93,375.00 has been credited to your SBI account for Procurement #PRC-2026-0891.",
                timestamp="1 hour ago",
                read=True,
            ),
            Notification(
                id="n3",
                user_id=farmer_user.id,
                type="procurement",
                title="Grade A Quality Verified",
                message="Your Wheat batch has been certified Grade A (Moisture 11.2%). MSP rate of ₹2,275/Qtl applied.",
                timestamp="2 hours ago",
                read=True,
            ),
            Notification(
                id="n4",
                user_id=farmer_user.id,
                type="queue",
                title="Mandi Throughput Update",
                message="Jaipur APMC processing speed increased by 25% after opening auxiliary weighbridge counter #4.",
                timestamp="3 hours ago",
                read=True,
            ),
        ]
        db.add_all(notifications)
        db.commit()
