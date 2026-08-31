import fs from 'fs';
import path from 'path';

const targetPath = path.resolve('../retail-next-software-api/src/controllers/employees.controller.js');
let content = fs.readFileSync(targetPath, 'utf8');

const oldBlock = `    const cleanPhone = String(phone).replace(/\\D/g, '').slice(-10);
    const empId = req.body.id || ('emp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));

    const newEmployee = {
      id: empId,
      businessId,
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : '',
      city: city ? city.trim() : '',
      address: address ? address.trim() : '',
      wageType: wageType === 'Daily' ? 'Daily' : 'Monthly',
      salary: Number(salary) || 0,
      role: role ? role.trim() : 'Staff',
      status: status || 'Active',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    await db.collection('employees').doc(empId).set(newEmployee);`;

const newBlock = `    const cleanPhone = String(phone).replace(/\\D/g, '').slice(-10);
    
    // Generate unique 7-digit numeric ID (1000000 to 9999999)
    let empId = req.body.id;
    if (!empId || !/^\\d{7}$/.test(String(empId))) {
      let isUnique = false;
      while (!isUnique) {
        const rand7 = Math.floor(1000000 + Math.random() * 9000000).toString();
        const existingDoc = await db.collection('employees').doc(rand7).get();
        if (!existingDoc.exists) {
          empId = rand7;
          isUnique = true;
        }
      }
    } else {
      empId = String(empId);
    }

    const newEmployee = {
      id: empId,
      businessId,
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : '',
      city: city ? city.trim() : '',
      address: address ? address.trim() : '',
      wageType: wageType === 'Daily' ? 'Daily' : 'Monthly',
      salary: Number(salary) || 0,
      role: role ? role.trim() : 'Staff',
      status: status || 'Active',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    await db.collection('employees').doc(empId).set(newEmployee);`;

if (content.includes("const empId = req.body.id || ('emp_'")) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Successfully updated employees.controller.js with 7-digit numeric unique ID generation!');
} else {
  console.log('Target block already modified or not found.');
}
