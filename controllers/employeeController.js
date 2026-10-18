const Employee = require('../models/Employee');
const log = require('../utils/logger');

async function findOwnedEmployee(eid, userId, res) {
  const employee = await Employee.findOne({ _id: eid, user: userId });

  if (employee) return employee;

  if (await Employee.exists({ _id: eid })) {
    log('authorization_failed', { userId: String(userId), employeeId: eid });
    res.status(403).json({
      status: false,
      message: 'You cannot access another user’s employee'
    });
  } else {
    res.status(404).json({
      status: false,
      message: 'Employee not found'
    });
  }

  return null;
}

async function listEmployees(req, res, next) {
  try {
    const employees = await Employee.find({ user: req.user._id });
    log('employees_listed', { userId: req.user.id });
    res.status(200).json({ status: true, employees });
  } catch (error) {
    next(error);
  }
}

async function createEmployee(req, res, next) {
  try {
    const employee = await Employee.create({
      ...req.body,
      user: req.user._id
    });

    log('employee_created', {
      userId: req.user.id,
      employeeId: employee.id
    });

    res.status(201).json({
      status: true,
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    next(error);
  }
}

async function getEmployee(req, res, next) {
  try {
    const employee = await findOwnedEmployee(
      req.params.eid, req.user._id, res
    );

    if (!employee) return;

    res.status(200).json({ status: true, employee });
  } catch (error) {
    next(error);
  }
}

async function updateEmployee(req, res, next) {
  try {
    const employee = await findOwnedEmployee(
      req.params.eid, req.user._id, res
    );

    if (!employee) return;

    Object.assign(employee, req.body);
    await employee.save();

    log('employee_updated', {
      userId: req.user.id,
      employeeId: employee.id
    });

    res.status(200).json({
      status: true,
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    next(error);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    const employee = await findOwnedEmployee(
      req.query.eid, req.user._id, res
    );

    if (!employee) return;

    await Employee.deleteOne({
      _id: employee._id,
      user: req.user._id
    });

    log('employee_deleted', {
      userId: req.user.id,
      employeeId: employee.id
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listEmployees, createEmployee, getEmployee,
  updateEmployee, deleteEmployee
};
