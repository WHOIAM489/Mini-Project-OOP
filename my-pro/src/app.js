class Employee {
    constructor(id, name, department, taxRate = 3) {
        if (this.constructor === Employee) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this._id = id;
        this._name = name;
        this._department = department;
        this._taxRate = taxRate;
    }

    get id() { return this._id; }
    get name() { return this._name; }
    get department() { return this._department; }
    get taxRate() { return this._taxRate; }

    calculateSalary() { throw new Error("Method 'calculateSalary()' must be implemented."); }
    getEmployeeType() { throw new Error("Method 'getEmployeeType()' must be implemented."); }
    getDetails() { throw new Error("Method 'getDetails()' must be implemented."); }
    
    calculateDeduction() { throw new Error("Method 'calculateDeduction()' must be implemented."); }

    calculateNetSalary() {
        return this.calculateSalary() - this.calculateDeduction();
    }
}


class FullTimeEmployee extends Employee {
    constructor(id, name, department, monthlySalary, bonus, taxRate = 3, ssRate = 5) {
        super(id, name, department, taxRate); 
        this._monthlySalary = monthlySalary;
        this._bonus = bonus;
        this._ssRate = ssRate; 
    }

    calculateSalary() {
        return this._monthlySalary + this._bonus;
    }

    calculateDeduction() {

        const socialSecurity = Math.min(this._monthlySalary * (this._ssRate / 100), 750);
        const withholdingTax = this.calculateSalary() * (this._taxRate / 100);
        
        return socialSecurity + withholdingTax;
    }

    getEmployeeType() { return "พนักงานประจำ"; }
    getDetails() {
        const ss = Math.min(this._monthlySalary * (this._ssRate / 100), 750);
        const tax = this.calculateSalary() * (this._taxRate / 100);
        return `
            เงินเดือน: ฿${this._monthlySalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} | โบนัส: ฿${this._bonus.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}<br>
            <span class="text-red-400 font-medium text-[11px]">หัก ปตส. ${this._ssRate}%: ฿${ss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} | หักภาษี ${this._taxRate}%: ฿${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        `;
    }
}

class PartTimeEmployee extends Employee {
    // [อัปเดต] รับค่า taxRate เพิ่มเข้ามาผ่าน constructor
    constructor(id, name, department, hourlyRate, hoursWorked, taxRate = 3) {
        super(id, name, department, taxRate);
        this._hourlyRate = hourlyRate;
        this._hoursWorked = hoursWorked;
    }

    calculateSalary() {
        return this._hourlyRate * this._hoursWorked;
    }

    calculateDeduction() {
        const withholdingTax = this.calculateSalary() * (this._taxRate / 100);
        return withholdingTax;
    }

    getEmployeeType() { return "พนักงานพาร์ทไทม์"; }
    
    getDetails() {
        const tax = this.calculateSalary() * (this._taxRate / 100);
        return `
            อัตรา: ฿${this._hourlyRate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/ชม. | ทำงาน: ${this._hoursWorked} ชม.<br>
            <span class="text-red-400 font-medium text-[11px]">หักภาษี ${this._taxRate}% (ไม่มี ปตส.): ฿${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        `;
    }
}

class Company {
    constructor() {
        this._employees = []; 
    }

    addEmployee(emp) {
        const exists = this._employees.some(e => e.id === emp.id);
        if (exists) throw new Error(`รหัสพนักงาน ${emp.id} มีในระบบแล้ว!`);
        this._employees.push(emp);
    }

    removeEmployee(id) {
        this._employees = this._employees.filter(emp => emp.id !== id);
    }

    getAllEmployees() { return this._employees; }

    searchEmployees(keyword) {
        const term = keyword.toLowerCase();
        return this._employees.filter(emp => 
            emp.id.toLowerCase().includes(term) || 
            emp.name.toLowerCase().includes(term)
        );
    }

    calculateTotalPayroll() {
        return this._employees.reduce((sum, emp) => sum + emp.calculateSalary(), 0);
    }
}


class PayrollGUI {
    constructor() {
        this.company = new Company();
        this.initEvents();
        this.addSampleData();
        this.render();
    }

    initEvents() {
        const numberInputs = document.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.setAttribute('step', 'any'); 
        });

        const typeSelect = document.getElementById('empType');
        typeSelect.addEventListener('change', (e) => {
            const isFullTime = e.target.value === 'fulltime';
            document.getElementById('fullTimeInputs').classList.toggle('hidden', !isFullTime);
            document.getElementById('partTimeInputs').classList.toggle('hidden', isFullTime);
            
            document.getElementById('ssRateContainer').classList.toggle('hidden', !isFullTime);
        });

        document.getElementById('payrollForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEmployee();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.render(this.company.searchEmployees(e.target.value));
        });

        const tableBody = document.getElementById('employeeTableBody');
        tableBody.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const empId = deleteBtn.getAttribute('data-id');
                this.deleteEmployee(empId);
            }
        });
    }

    addSampleData() {
        const samples = [
            new FullTimeEmployee('EMP-001', 'สมชาย ใจดี', 'IT', 45000, 5000, 3, 5),
            new FullTimeEmployee('EMP-002', 'สุนิสา วงศ์ทอง', 'Finance', 68000, 12000, 5, 5),
            new PartTimeEmployee('EMP-003', 'ธนกฤต พงษ์ไทย', 'IT', 180.5, 64, 3),
            new PartTimeEmployee('EMP-004', 'ปิยะดา ศรีสุข', 'Marketing', 220, 40, 3)
        ];
        samples.forEach(emp => this.company.addEmployee(emp));
    }

    saveEmployee() {
        try {
            const id = document.getElementById('empId').value;
            const name = document.getElementById('empName').value;
            const dept = document.getElementById('empDept').value;
            const type = document.getElementById('empType').value;
            const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
            const ssRate = parseFloat(document.getElementById('ssRate').value) || 0;

            let emp;
            if (type === 'fulltime') {
                const salary = parseFloat(document.getElementById('monthlySalary').value) || 0;
                const bonus = parseFloat(document.getElementById('bonus').value) || 0;
                emp = new FullTimeEmployee(id, name, dept, salary, bonus, taxRate, ssRate);
            } else {
                const rate = parseFloat(document.getElementById('hourlyRate').value) || 0;
                const hours = parseFloat(document.getElementById('hoursWorked').value) || 0;
                emp = new PartTimeEmployee(id, name, dept, rate, hours, taxRate);
            }

            this.company.addEmployee(emp);
            document.getElementById('payrollForm').reset();
            document.getElementById('fullTimeInputs').classList.remove('hidden');
            document.getElementById('partTimeInputs').classList.add('hidden');
            document.getElementById('ssRateContainer').classList.remove('hidden');
            document.getElementById('taxRate').value = '3';
            document.getElementById('ssRate').value = '5';
            
            this.render();

        } catch (error) {
            alert(error.message);
        }
    }

    deleteEmployee(id) {
        if (confirm(`ต้องการลบรหัส ${id} ใช่หรือไม่?`)) {
            this.company.removeEmployee(id);
            this.render();
        }
    }

    render(data = null) {
        const employees = data || this.company.getAllEmployees();
        const tbody = document.getElementById('employeeTableBody');
        tbody.innerHTML = '';

        employees.forEach((emp) => {
            const isFT = emp instanceof FullTimeEmployee;
            const badge = isFT ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
            
            const gross = emp.calculateSalary();
            const deduct = emp.calculateDeduction();
            const net = emp.calculateNetSalary();

            tbody.innerHTML += `
                <tr class="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0">
                    <!-- คอลัมน์ 1: พนักงาน (ชื่อ + รหัส) -->
                    <td class="px-6 py-4">
                        <div class="font-medium text-slate-900">${emp.name}</div>
                        <div class="text-xs text-slate-400 mt-0.5">${emp.id}</div>
                    </td>
                    
                    <!-- คอลัมน์ 2: แผนก/ประเภท -->
                    <td class="px-6 py-4">
                        <div class="text-slate-900 text-sm">${emp.department}</div>
                        <div class="mt-1"><span class="px-2 py-0.5 text-[10px] font-medium rounded-full border ${badge}">${emp.getEmployeeType()}</span></div>
                    </td>
                    
                    <!-- คอลัมน์ 3: รายละเอียด (อัปเดตข้อมูล % การหักแบบไดนามิก) -->
                    <td class="px-6 py-4 text-xs text-slate-500 leading-relaxed">
                        ${emp.getDetails()}
                    </td>
                    
                    <!-- คอลัมน์ 4: ยอดสุทธิ (มีแจกแจง) -->
                    <td class="px-6 py-4 text-right">
                        <div class="text-xs text-slate-400 line-through mb-0.5">รวม: ฿${gross.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div class="text-xs text-red-400 mb-1">- หัก: ฿${deduct.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div class="font-semibold text-emerald-600 text-base">฿${net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </td>
                    
                    <!-- คอลัมน์ 5: จัดการ (ปุ่มลบไอคอนถังขยะ) -->
                    <td class="px-6 py-4 text-center">
                        <button data-id="${emp.id}" class="delete-btn text-slate-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="ลบข้อมูลพนักงาน">
                            <svg class="w-5 h-5 mx-auto pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        });

        document.getElementById('totalEmpCount').innerText = employees.length;
        
        const totalPay = this.company.calculateTotalPayroll();
        document.getElementById('totalPayrollSum').innerText = `฿${totalPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        const avg = employees.length > 0 ? totalPay / employees.length : 0;
        document.getElementById('avgSalary').innerText = `฿${avg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
}

window.onload = () => {
    window.gui = new PayrollGUI();
};