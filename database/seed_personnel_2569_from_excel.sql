SET NAMES utf8mb4;
START TRANSACTION;
DELETE FROM personnel_profiles WHERE page_slug IN ('personnel-data', 'administrators');
DELETE FROM personnel_summary_stats WHERE academic_year = '2569';

INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('administrators', 'ผู้บริหาร', 'นายอภิชาติ กุลธานี', 'ผู้อำนวยการ
ผู้อำนวยการวิทยาลัย', 'วิทยาลัยสารพัดช่างสุรินทร์', 'ผู้บริหาร', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '1', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('administrators', 'ผู้บริหาร', 'นายเทอดศักดิ์ ผลพูน', 'รองผู้อำนวยการ
รองผู้อำนวยการฝ่ายบริหารทรัพยากร', 'ฝ่ายบริหารทรัพยากร / ยุทธศาสตร์และแผนงาน', 'ผู้บริหาร', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '2', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('administrators', 'ผู้บริหาร', 'นางปาลิดา ศรีสุภานุกค์', 'รองผู้อำนวยการ
รองผู้อำนวยการฝ่ายวิชาการ', 'ฝ่ายวิชาการ / ยุทธศาสตร์และแผนงาน', 'ผู้บริหาร', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '3', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('administrators', 'ผู้บริหาร', 'นางสุนีย์ ปรีชานนทกุล', 'รองผู้อำนวยการ
รองผู้อำนวยการฝ่ายกิจการนักเรียน นักศึกษา', 'ฝ่ายกิจการนักเรียน นักศึกษา / ยุทธศาสตร์และแผนงาน', 'ผู้บริหาร', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '4', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นายธารา แสงเพ็ชร', 'ครู คศ.3
หัวหน้าสาขาวิชาคอมพิวเตอร์ / หัวหน้างานมาตรฐานและการประกันคุณภาพการศึกษา', 'สาขาวิชาคอมพิวเตอร์ / ฝ่ายยุทธศาสตร์ฯ', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '5', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นายสุรชัย ทันสมัย', 'ครู คศ.3
หัวหน้าสาขาวิชาช่างกลโรงงาน', 'สาขาวิชาช่างกลโรงงาน', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '6', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นายธณชัย ดาทอง', 'ครู คศ.2
หัวหน้าสาขาวิชาช่างยนต์', 'สาขาวิชาช่างยนต์', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '7', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นายรัฐพงศ์ กาบจันทร์', 'ครู คศ.2
หัวหน้างานบริหารและพัฒนาทรัพยากรบุคคล', 'ฝ่ายบริหารทรัพยากร / สาขาวิชาช่างยนต์', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '8', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นางพนิดา แจ้งสว่าง', 'ครู คศ.2
หัวหน้างานติดตามและประเมินผลการอาชีวศึกษา', 'ฝ่ายยุทธศาสตร์และแผนงาน / แผนกสามัญสัมพันธ์', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
หมายเหตุ: อัปเดตตามคำสั่งที่ 154/2569
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '9', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นางอารีรัตน์ ประสงค์คืน', 'ครู คศ.2
หัวหน้างานการเงิน', 'ฝ่ายบริหารทรัพยากร / สาขาวิชาการบัญชี', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '10', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นางสาวอริสรา ดลเสมอ', 'ครู คศ.2
หัวหน้างานพัฒนาหลักสูตรและการจัดการเรียนรู้', 'ฝ่ายวิชาการ / สาขาวิชาคอมพิวเตอร์', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '11', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นายศรพิทักษ์ เรืองเศษ', 'ครู คศ.1
หัวหน้างานพัสดุ', 'ฝ่ายบริหารทรัพยากร / แผนกสามัญสัมพันธ์', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '12', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นายจิตกร สมานมิตร', 'ครู คศ.1
หัวหน้างานวัดผลประเมินผล', 'ฝ่ายวิชาการ / สาขาวิชาช่างกลโรงงาน', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '13', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นางสาวเบญจมาภรณ์ ฤทธิเกรียง', 'ครู คศ.1
ประจำสาขาวิชาคอมพิวเตอร์ / ผู้ช่วยงานประกันคุณภาพและงานยุทธศาสตร์', 'สาขาวิชาคอมพิวเตอร์ / ฝ่ายยุทธศาสตร์ฯ', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '14', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นางสาวมงคลักษณ์ คำแพงพล', 'ครู คศ.1
หัวหน้างานครูที่ปรึกษาและการแนะแนว / หัวหน้าสาขาวิชาอาหารและโภชนาการ', 'ฝ่ายกิจการนักเรียนฯ / สาขาอาหารและโภชนาการ', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '15', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นางสาวสุกัญญา สวัสดี', 'ครูผู้ช่วย
หัวหน้างานการบัญชี', 'ฝ่ายบริหารทรัพยากร / สาขาวิชาการบัญชี', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '16', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นางสาวบุษราคัม ใบทอง', 'ครูผู้ช่วย
หัวหน้างานบริหารงานทั่วไป / หัวหน้าสาขาวิชาการจัดการงานบริการสถานพยาบาล / หัวหน้าสาขาวิชาการท่องเที่ยว', 'ฝ่ายบริหารทรัพยากร / ฝ่ายวิชาการ', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
หมายเหตุ: อัปเดตตามคำสั่งที่ 136/2569
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '17', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นางสาวพวงชมพู ขุนทอง', 'ครูผู้ช่วย
หัวหน้างานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ / หัวหน้าสาขาวิชาคหกรรมศาสตร์ทั่วไป / หัวหน้าสาขาวิชาผ้าและเครื่องแต่งกาย', 'ฝ่ายยุทธศาสตร์ฯ / ฝ่ายวิชาการ', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
หมายเหตุ: อัปเดตตามคำสั่งเพิ่มเติม 24 มิ.ย. 2569
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '18', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ข้าราชการครู', 'นายวุฒิไกร ขยันการ', 'ครูผู้ช่วย
หัวหน้าสาขาวิชาช่างไฟฟ้ากำลัง', 'สาขาวิชาช่างไฟฟ้ากำลัง / งานพัสดุ', 'ข้าราชการครู', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '19', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นางสาวอภิญญาภรณ์ ป้องเขต', 'พนักงานราชการ (ครู)
หัวหน้างานสวัสดิการนักเรียน นักศึกษา / หัวหน้าแผนกวิชาสามัญสัมพันธ์', 'ฝ่ายกิจการนักเรียนฯ / ฝ่ายวิชาการ', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '20', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นายอดิศร วัฒนาสุทธิ์', 'พนักงานราชการ (ครู)
หัวหน้างานอาคารสถานที่ / หัวหน้าแผนกวิชาเทคนิคพื้นฐาน', 'ฝ่ายบริหารทรัพยากร / ฝ่ายวิชาการ', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '21', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นายวิเชียรสวัสดิ์ แก้วมณี', 'พนักงานราชการ (ครู)
หัวหน้างานส่งเสริมการวิจัย นวัตกรรม และสิ่งประดิษฐ์', 'ฝ่ายยุทธศาสตร์ฯ / สาขาวิชาช่างไฟฟ้ากำลัง', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '22', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นายบุญชิต รุ่งทอง', 'พนักงานราชการ (ครู)
หัวหน้างานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ', 'ฝ่ายวิชาการ / สาขาวิชาช่างยนต์', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '23', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นายกิตติ มั่นหมาย', 'พนักงานราชการ (ครู)
ประจำสาขาวิชาช่างยนต์ / ผู้ช่วยงานอาคารสถานที่', 'สาขาวิชาช่างยนต์ / งานอาคารสถานที่', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '24', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นายอักษรเพชร วิจิตรเรืองชัย', 'พนักงานราชการ (ครู)
หัวหน้างานการศึกษาพิเศษและความเสมอภาคทางการศึกษา', 'ฝ่ายวิชาการ / สาขาวิชาช่างกลโรงงาน', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '25', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นายจักรพงศ์ ปัญญาดี', 'พนักงานราชการ (ครู)
หัวหน้าสาขาวิชาช่างอิเล็กทรอนิกส์ / หัวหน้างานโครงการพิเศษและบริการชุมชน', 'ฝ่ายวิชาการ / ฝ่ายกิจการนักเรียนฯ', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '26', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นายอุเทน ศิริทอง', 'พนักงานราชการ (ครู)
หัวหน้างานศูนย์ดิจิทัลและสื่อสารองค์กร', 'ฝ่ายยุทธศาสตร์ฯ / สาขาวิชาช่างไฟฟ้ากำลัง', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '27', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นายอัฐวุธ สุไต้ทอน', 'พนักงานราชการ (ครู)
หัวหน้างานทะเบียน', 'ฝ่ายบริหารทรัพยากร / สาขาวิชาช่างอิเล็กทรอนิกส์', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '28', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นางสาวอำภา ผุดงดี', 'พนักงานราชการ (ครู)
หัวหน้างานพัฒนายุทธศาสตร์ แผนงานและงบประมาณ', 'ฝ่ายยุทธศาสตร์ฯ / งานการบัญชี', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
หมายเหตุ: อัปเดตตามคำสั่งที่ 154/2569
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '29', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พนักงานราชการ', 'นางสาวสิรินุชญ์ธี พานิชศิริ', 'พนักงานราชการ (ครู)
หัวหน้างานกิจกรรมนักเรียน นักศึกษา', 'ฝ่ายกิจการนักเรียนฯ / สาขาอาหารและโภชนาการ', 'พนักงานราชการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '30', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นางสาววัชยา โยมสองชั้น', 'ครูจ้างสอน
หัวหน้างานวิทยบริการและเทคโนโลยีการศึกษา', 'ฝ่ายวิชาการ / แผนกสามัญสัมพันธ์', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '31', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นายวีระกรณ์ สถาน', 'ครูจ้างสอน
ประจำสาขาวิชาช่างยนต์ / ผู้ช่วยงานพัสดุ', 'สาขาวิชาช่างยนต์ / งานพัสดุ', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '32', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นางสาวชลันธรณ์ สุดอุดม', 'ครูจ้างสอน
ประจำสาขาวิชาช่างกลโรงงาน / ผู้ช่วยงานพัสดุ', 'สาขาวิชาช่างกลโรงงาน / งานพัสดุ', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '33', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นายธนากรณ์ บุตรธินดา', 'ครูจ้างสอน
ประจำสาขาวิชาอาหารและโภชนาการ / งานกิจกรรมและโครงการ', 'สาขาวิชาอาหารและโภชนาการ', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '34', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นางสาวกัญญารัตน์ บุญญโกศล', 'ครูจ้างสอน
ประจำสาขาวิชาอาหารและโภชนาการ', 'สาขาวิชาอาหารและโภชนาการ', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '35', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นางสาวจุฑามาศ จันทร์สิงขะ', 'ครูจ้างสอน
หัวหน้าสาขาวิชาการบัญชี', 'สาขาวิชาการบัญชี / งานการเงิน', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '36', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นายอภินันท์ เสาโกมุท', 'ครูจ้างสอน
ประจำสาขาวิชาคอมพิวเตอร์', 'สาขาวิชาคอมพิวเตอร์', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '37', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นายจิรานุวัฒน์ ทุ่มโสภา', 'ครูจ้างสอน
หัวหน้างานปกครองและความปลอดภัยนักเรียน นักศึกษา', 'ฝ่ายกิจการนักเรียนฯ / สาขาวิชาช่างกลโรงงาน', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '38', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นางสาวปีเยพร แสงม่วง', 'ผู้ชำนาญการช่างเสริมสวย
ประจำสาขาวิชาคหกรรมศาสตร์ทั่วไป', 'สาขาวิชาคหกรรมศาสตร์ทั่วไป', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '39', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นายชัยพล มีศิริ', 'ผู้ชำนาญการช่างตัดผมชาย
ประจำสาขาวิชาคหกรรมศาสตร์ทั่วไป', 'สาขาวิชาคหกรรมศาสตร์ทั่วไป', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '40', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นางสาววรินทร์รัศมี ธนโชติสุธา', 'ผู้ชำนาญการผ้าและเครื่องแต่งกาย
ประจำสาขาวิชาผ้าและเครื่องแต่งกาย', 'สาขาวิชาผ้าและเครื่องแต่งกาย', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '41', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'ครูจ้างสอน/ผู้ชำนาญการ', 'นางสายเพียร กองงาม', 'ผู้ชำนาญการนวดแผนไทย
ประจำสาขาวิชาการท่องเที่ยว', 'สาขาวิชาการท่องเที่ยว', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '42', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางศรีธรา สาแก้ว', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานบริหารงานทั่วไป / งานบุคลากร', 'ฝ่ายบริหารทรัพยากร', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '43', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางสาวนิติกา ยอดดำ', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานการเงิน', 'ฝ่ายบริหารทรัพยากร', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '44', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางสาววิภา ชนะสุข', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานการเงิน', 'ฝ่ายบริหารทรัพยากร', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '45', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางสาวนภัสวรรณ งามนวล', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานการบัญชี / งานอาคารสถานที่', 'ฝ่ายบริหารทรัพยากร', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '46', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นายสุธี เหมตลาด', 'ลูกจ้างชั่วคราว
พนักงานขับรถยนต์', 'งานพัสดุ / งานอาคารสถานที่', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '47', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางสาวศศิธร นามวัฒน์ราชา', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานพัสดุ', 'ฝ่ายบริหารทรัพยากร', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '48', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นายบุรินทร์ ผงาตนัตถ์', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานพัสดุ', 'ฝ่ายบริหารทรัพยากร', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '49', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นายประสพ ศรีขาว', 'ลูกจ้างชั่วคราว
นักการภารโรง', 'งานอาคารสถานที่', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '50', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นายสมบัติ พาเจริญ', 'ลูกจ้างชั่วคราว
นักการภารโรง', 'งานอาคารสถานที่', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '51', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางจันทร์เพ็ญ แต้มสุด', 'ลูกจ้างชั่วคราว
นักการภารโรง', 'งานอาคารสถานที่', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '52', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นายสมบัติ บุญลอย', 'ลูกจ้างชั่วคราว
นักการภารโรง', 'งานอาคารสถานที่', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '53', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นายอัตรา อินทร์งาม', 'ลูกจ้างชั่วคราว
ยามรักษาการณ์', 'งานอาคารสถานที่', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '54', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นายสาน มันธุภา', 'ลูกจ้างชั่วคราว
ยามรักษาการณ์', 'งานอาคารสถานที่', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
หมายเหตุ: โปรดตรวจทานสะกดจากต้นฉบับสแกน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '55', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางสาวภัทรกาญจน์ แข่งขัน', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานทะเบียน', 'ฝ่ายบริหารทรัพยากร', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '56', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางสาววรรแทนา ศาลางาม', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานพัฒนาหลักสูตรและการจัดการเรียนรู้', 'ฝ่ายวิชาการ', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '57', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางสุรีสา สมานสุข', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานวัดผลประเมินผล', 'ฝ่ายวิชาการ', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
หมายเหตุ: โปรดตรวจทานสะกดจากต้นฉบับสแกน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '58', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางสาวพิมพ์เพ็ญ วรรณปฏิมภ์', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานกิจกรรมนักเรียน นักศึกษา / งานโครงการพิเศษ', 'ฝ่ายกิจการนักเรียนฯ', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
หมายเหตุ: โปรดตรวจทานสะกดจากต้นฉบับสแกน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '59', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'เจ้าหน้าที่/ลูกจ้าง', 'นางสาวพรณระวี กุลธานี', 'ลูกจ้างชั่วคราว
เจ้าหน้าที่งานปกครองและความปลอดภัย / งานสวัสดิการ', 'ฝ่ายกิจการนักเรียนฯ', 'เจ้าหน้าที่/ลูกจ้าง', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: ปัจจุบัน
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '60', 'active');
INSERT INTO personnel_profiles (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status) VALUES ('personnel-data', 'พ้นจากตำแหน่ง/ถูกแทนที่', 'นางสาวเนติมา เทือกสุบรรณ', 'ครูผู้ช่วย
เดิม: หัวหน้างานบริหารงานทั่วไป / หัวหน้าสาขาคหกรรมศาสตร์ทั่วไป / หัวหน้าสาขาผ้าและเครื่องแต่งกาย', 'ตำแหน่งเดิม', 'พ้นจากตำแหน่ง/ถูกแทนที่', NULL, NULL, NULL, 'ปีการศึกษา 2569', NULL, NULL, 'สถานะ: แทนที่แล้ว
หมายเหตุ: ตามคำสั่งเพิ่มเติม: ลาออกจากราชการและรับบรรจุที่อื่น
แหล่งข้อมูล: spc_personnel_positions_updated_2569.xlsx', '61', 'inactive');

INSERT INTO personnel_summary_stats (academic_year, personnel_type, department, staff_count, context_note, sort_order, status) VALUES ('2569', 'ผู้บริหาร', NULL, '4', 'ข้อมูลจากไฟล์ spc_personnel_positions_updated_2569.xlsx', '1', 'active');
INSERT INTO personnel_summary_stats (academic_year, personnel_type, department, staff_count, context_note, sort_order, status) VALUES ('2569', 'ข้าราชการครู', NULL, '15', 'ข้อมูลจากไฟล์ spc_personnel_positions_updated_2569.xlsx', '2', 'active');
INSERT INTO personnel_summary_stats (academic_year, personnel_type, department, staff_count, context_note, sort_order, status) VALUES ('2569', 'พนักงานราชการ', NULL, '11', 'ข้อมูลจากไฟล์ spc_personnel_positions_updated_2569.xlsx', '3', 'active');
INSERT INTO personnel_summary_stats (academic_year, personnel_type, department, staff_count, context_note, sort_order, status) VALUES ('2569', 'ครูจ้างสอน/ผู้ชำนาญการ', NULL, '12', 'ข้อมูลจากไฟล์ spc_personnel_positions_updated_2569.xlsx', '4', 'active');
INSERT INTO personnel_summary_stats (academic_year, personnel_type, department, staff_count, context_note, sort_order, status) VALUES ('2569', 'เจ้าหน้าที่/ลูกจ้าง', NULL, '18', 'ข้อมูลจากไฟล์ spc_personnel_positions_updated_2569.xlsx', '5', 'active');
COMMIT;
