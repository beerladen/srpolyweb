from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


PROFILE_COLUMNS = [
    "page_slug",
    "section_title",
    "full_name",
    "position_title",
    "department",
    "committee_role",
    "contact_phone",
    "contact_email",
    "contact_channel",
    "term_period",
    "photo_path",
    "appointment_file",
    "profile_note",
    "sort_order",
    "status",
]


def sql_value(value: object) -> str:
    if value is None:
        return "NULL"

    text = str(value).strip()
    if not text:
        return "NULL"

    return "'" + text.replace("\\", "\\\\").replace("'", "''") + "'"


def page_slug_for(group: str) -> str:
    return "administrators" if group == "ผู้บริหาร" else "personnel-data"


def section_for(group: str) -> str:
    return group


def status_for(group: str, status_text: str) -> str:
    if "พ้น" in group or "แทนที่" in status_text:
        return "inactive"

    return "active"


def build_seed(input_path: Path, output_path: Path) -> tuple[int, int]:
    profiles = pd.read_excel(input_path, sheet_name="รายชื่อบุคลากร", dtype=str, header=2).fillna("")
    dashboard = pd.read_excel(input_path, sheet_name="Dashboard", dtype=str, header=None).fillna("")

    lines: list[str] = [
        "SET NAMES utf8mb4;",
        "START TRANSACTION;",
        "DELETE FROM personnel_profiles WHERE page_slug IN ('personnel-data', 'administrators');",
        "DELETE FROM personnel_summary_stats WHERE academic_year = '2569';",
        "",
    ]

    profile_count = 0
    for _, row in profiles.iterrows():
        group = str(row["กลุ่มบุคลากร"]).strip()
        full_name = str(row["ชื่อ-สกุล"]).strip()

        if not full_name:
            continue

        position_level = str(row["ตำแหน่ง/ระดับ"]).strip()
        current_role = str(row["ตำแหน่งหน้าที่หลักปัจจุบัน"]).strip()
        department = str(row["หน่วยงาน/สังกัดที่เกี่ยวข้อง"]).strip()
        status_text = str(row["สถานะ"]).strip()
        note = str(row["หมายเหตุ"]).strip()
        sort_order = int(float(str(row["ลำดับ"]).strip() or 0))

        position_title = "\n".join([item for item in [position_level, current_role] if item])
        profile_note = "\n".join(
            [
                item
                for item in [
                    f"สถานะ: {status_text}" if status_text else "",
                    f"หมายเหตุ: {note}" if note else "",
                    "แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx",
                ]
                if item
            ]
        )

        values = [
            page_slug_for(group),
            section_for(group),
            full_name,
            position_title,
            department,
            group,
            None,
            None,
            None,
            "ปีการศึกษา 2569",
            None,
            None,
            profile_note,
            sort_order,
            status_for(group, status_text),
        ]

        lines.append(
            f"INSERT INTO personnel_profiles ({', '.join(PROFILE_COLUMNS)}) VALUES "
            f"({', '.join(sql_value(value) for value in values)});"
        )
        profile_count += 1

    lines.append("")

    summary_count = 0
    for row in dashboard.values.tolist()[3:8]:
        personnel_type = str(row[0]).strip()
        staff_count = str(row[1]).strip()

        if not personnel_type:
            continue

        values = [
            "2569",
            personnel_type,
            None,
            int(float(staff_count or 0)),
            "ข้อมูลจากไฟล์ spc_personnel_positions_updated_2569.xlsx",
            summary_count + 1,
            "active",
        ]

        lines.append(
            "INSERT INTO personnel_summary_stats "
            "(academic_year, personnel_type, department, staff_count, context_note, sort_order, status) VALUES "
            f"({', '.join(sql_value(value) for value in values)});"
        )
        summary_count += 1

    lines.append("COMMIT;")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return profile_count, summary_count


def main() -> None:
    parser = argparse.ArgumentParser(description="Build SRPOLY personnel seed SQL from the 2569 Excel workbook.")
    parser.add_argument("input", type=Path, help="Path to spc_personnel_positions_updated_2569.xlsx")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("database/seed_personnel_2569_from_excel.sql"),
        help="Output SQL path",
    )
    args = parser.parse_args()

    profile_count, summary_count = build_seed(args.input, args.output)
    print(f"wrote {args.output} ({profile_count} profiles, {summary_count} summary rows)")


if __name__ == "__main__":
    main()
