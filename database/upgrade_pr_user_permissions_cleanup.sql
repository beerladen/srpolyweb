UPDATE users u
JOIN roles r ON r.id = u.role_id
SET u.permissions = '[]',
    u.updated_at = NOW()
WHERE LOWER(u.email) = 'pr@srpoly.ac.th'
  AND r.role_name = 'งานประชาสัมพันธ์'
  AND COALESCE(u.permissions, '') NOT IN ('', '[]');
