// Copyright (c) 2022, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Amount Request', {
	employee: function (frm) {

		frappe.db.get_value('Company',
			frappe.defaults.get_default('company'), 'default_employee_petty_cash_payable_account_cf'
		).then((result) => {
			frappe.call({
				method: 'erpnext.accounts.utils.get_balance_on',
				args: {
					account: result.message.default_employee_petty_cash_payable_account_cf,
					date: frappe.datetime.get_today(),
					party_type: "Employee",
					party: frm.doc.employee
				}, callback: function (r) {
					frm.set_value("party_balance", r.message)
				}
			})
		})

	},

	validate: function (frm) {
		let total_amount = frm.doc.amount_request_detail.reduce(function (acc, item) { return acc + item.amount; }, 0);
		frm.set_value("total_amount", total_amount)
		frm.set_value("balance_after_request", total_amount + (frm.doc.party_balance || 0))
	},

	refresh: function (frm) {
		if (frm.doc.docstatus == 1) {
			frm.add_custom_button(__('Make Expense Entry'), function () {
				var expense = frappe.model.make_new_doc_and_get_name('Expense Entry');
				expense = locals['Expense Entry'][expense];
				expense.expense_type = 'Employee Petty Cash';
				expense.company = frm.doc.company;
				expense.party_type = 'Employee';
				expense.party = frm.doc.employee;
				frappe.set_route('Form', 'Expense Entry', expense.name);
			});
		}
	},
	setup: function (frm) {
		frm.set_query("department", function () {
			return {
				filters: {
					company: frm.doc.company
				}
			}
		});
	}

});
