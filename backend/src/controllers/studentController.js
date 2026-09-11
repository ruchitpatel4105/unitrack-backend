const bcrypt = require('bcryptjs');
const { isLive, query, memoryStore } = require('../config/db');

async function getAllStudents(req, res) {
  try {
    const { search, route_id } = req.query;

    if (isLive()) {
      let sql = `
        SELECT u.id, u.name, u.email, u.phone, u.student_id, u.dob, 
               u.pickup_stop, u.assigned_route_id, u.pass_number, 
               u.transport_fee_status, u.avatar_url, u.created_at,
               r.route_name, r.route_code
        FROM users u
        LEFT JOIN routes r ON u.assigned_route_id = r.id
        WHERE u.role = 'student'
      `;
      const params = [];

      if (route_id) {
        sql += ' AND u.assigned_route_id = ?';
        params.push(route_id);
      }
      if (search) {
        sql += ' AND (u.student_id LIKE ? OR u.phone LIKE ? OR u.name LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      sql += ' ORDER BY u.id DESC';
      const students = await query(sql, params);
      return res.status(200).json({ success: true, data: students });
    } else {
      let students = memoryStore.users.filter(u => u.role === 'student');

      if (route_id) {
        students = students.filter(s => s.assigned_route_id === Number(route_id));
      }
      if (search) {
        const s = search.toLowerCase();
        students = students.filter(u =>
          (u.student_id && u.student_id.toLowerCase().includes(s)) ||
          (u.phone && u.phone.toLowerCase().includes(s)) ||
          (u.name && u.name.toLowerCase().includes(s))
        );
      }

      const enriched = students.map(st => {
        const route = memoryStore.routes.find(r => r.id === st.assigned_route_id);
        return {
          id: st.id,
          name: st.name,
          email: st.email,
          phone: st.phone,
          student_id: st.student_id,
          dob: st.dob || '15082004',
          pickup_stop: st.pickup_stop || 'Parul Campus Gate',
          assigned_route_id: st.assigned_route_id || null,
          route_name: route ? route.route_name : st.assigned_route_name || null,
          route_code: route ? route.route_code : null,
          pass_number: st.pass_number || `PU-PASS-2024-${st.id}`,
          transport_fee_status: st.transport_fee_status || 'paid',
          avatar_url: st.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          created_at: st.created_at || new Date()
        };
      }).sort((a, b) => b.id - a.id);

      return res.status(200).json({ success: true, data: enriched });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function addStudent(req, res) {
  try {
    const { name, email, phone, student_id, dob, pickup_stop, assigned_route_id } = req.body;

    if (!name || !student_id || !phone || !dob) {
      return res.status(400).json({
        success: false,
        message: 'Name, 13-digit Enrollment ID, Phone, and Date of Birth (DDMMYYYY) are required.'
      });
    }

    const cleanedStudentId = student_id.trim();
    const cleanedDob = dob.trim();
    const cleanedEmail = email && email.trim() ? email.trim().toLowerCase() : `${cleanedStudentId}@paruluniversity.ac.in`;
    const pass_number = `PU-PASS-2024-${cleanedStudentId.slice(-5)}`;

    // Default password is DOB
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(cleanedDob, salt);

    if (isLive()) {
      const existing = await query('SELECT id FROM users WHERE student_id = ? OR phone = ? OR email = ?', [cleanedStudentId, phone, cleanedEmail]);
      if (existing && existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Student with this Enrollment Number, Phone, or Email is already registered.' });
      }

      const result = await query(
        `INSERT INTO users (role, name, email, phone, student_id, dob, pickup_stop, assigned_route_id, pass_number, transport_fee_status, password_hash)
         VALUES ('student', ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)`,
        [name, cleanedEmail, phone, cleanedStudentId, cleanedDob, pickup_stop || null, assigned_route_id ? Number(assigned_route_id) : null, pass_number, password_hash]
      );

      return res.status(201).json({
        success: true,
        message: 'Student transport pass created successfully',
        id: result.insertId,
        default_password: cleanedDob
      });
    } else {
      const conflict = memoryStore.users.find(u => u.student_id === cleanedStudentId || u.phone === phone || u.email === cleanedEmail);
      if (conflict) {
        return res.status(409).json({ success: false, message: 'Student with this Enrollment Number, Phone, or Email is already registered.' });
      }

      const route = memoryStore.routes.find(r => r.id === Number(assigned_route_id));

      const newStudent = {
        id: memoryStore.users.length + 1,
        role: 'student',
        name,
        email: cleanedEmail,
        phone,
        student_id: cleanedStudentId,
        driver_id: null,
        dob: cleanedDob,
        pickup_stop: pickup_stop || 'Main Campus Terminal',
        assigned_route_id: assigned_route_id ? Number(assigned_route_id) : 1,
        assigned_route_name: route ? route.route_name : 'Vadodara Station Express',
        pass_number,
        transport_fee_status: 'paid',
        password_hash,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        created_at: new Date()
      };

      memoryStore.users.unshift(newStudent);

      return res.status(201).json({
        success: true,
        message: 'Student transport pass created successfully',
        data: newStudent,
        default_password: cleanedDob
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateStudent(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, pickup_stop, assigned_route_id, transport_fee_status, dob } = req.body;

    if (isLive()) {
      await query(
        `UPDATE users 
         SET name = COALESCE(?, name),
             phone = COALESCE(?, phone),
             pickup_stop = COALESCE(?, pickup_stop),
             assigned_route_id = COALESCE(?, assigned_route_id),
             transport_fee_status = COALESCE(?, transport_fee_status),
             dob = COALESCE(?, dob)
         WHERE id = ? AND role = 'student'`,
        [name, phone, pickup_stop, assigned_route_id ? Number(assigned_route_id) : null, transport_fee_status, dob, id]
      );
      return res.status(200).json({ success: true, message: 'Student pass details updated' });
    } else {
      const student = memoryStore.users.find(u => u.id === Number(id) && u.role === 'student');
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

      if (name) student.name = name;
      if (phone) student.phone = phone;
      if (pickup_stop) student.pickup_stop = pickup_stop;
      if (assigned_route_id !== undefined) {
        student.assigned_route_id = Number(assigned_route_id);
        const r = memoryStore.routes.find(route => route.id === Number(assigned_route_id));
        if (r) student.assigned_route_name = r.route_name;
      }
      if (transport_fee_status) student.transport_fee_status = transport_fee_status;
      if (dob) student.dob = dob;

      return res.status(200).json({ success: true, message: 'Student pass details updated', data: student });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function resetStudentPassword(req, res) {
  try {
    const { id } = req.params;
    let student = null;

    if (isLive()) {
      const rows = await query('SELECT * FROM users WHERE id = ? AND role = "student"', [id]);
      if (rows && rows.length > 0) student = rows[0];
    } else {
      student = memoryStore.users.find(u => u.id === Number(id) && u.role === 'student');
    }

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Reset password to their DOB or generate a simple password
    const newPassword = student.dob || '15082004';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    if (isLive()) {
      await query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
    } else {
      student.password_hash = password_hash;
    }

    return res.status(200).json({
      success: true,
      message: `Password reset to DOB (${newPassword}) successfully`,
      student_id: student.student_id,
      password: newPassword
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteStudent(req, res) {
  try {
    const { id } = req.params;
    if (isLive()) {
      await query('DELETE FROM users WHERE id = ? AND role = "student"', [id]);
    } else {
      const idx = memoryStore.users.findIndex(u => u.id === Number(id) && u.role === 'student');
      if (idx !== -1) memoryStore.users.splice(idx, 1);
    }
    return res.status(200).json({ success: true, message: 'Student removed from transport roster' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAllStudents,
  addStudent,
  updateStudent,
  resetStudentPassword,
  deleteStudent
};
