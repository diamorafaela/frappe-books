import frappe
from frappe import _
from frappe.utils.jinja_globals import bundled_asset

from frappe_books.coa import chart_options
from frappe_books.company import default_company
from frappe_books.regional import INDIAN_STATES
from frappe_books.settings import regional_code


def extend_bootinfo(bootinfo):
	"""Add what the Books app starts with to the session boot."""
	bootinfo.books = {
		"country_code": regional_code(),
		"company": default_company(),
		"charts_of_accounts": chart_options(),
		"indian_states": INDIAN_STATES,
		"settings_panels": [
			panel
			for provider in frappe.get_hooks("books_settings_panels")
			for panel in frappe.get_attr(provider)()
			if frappe.has_permission(panel["doctype"], "read")
		],
		"document_actions": {
			doctype: [dict(action, label=_(action["label"])) for action in actions]
			for doctype, actions in frappe.get_hooks("books_document_actions", {}).items()
			if frappe.has_permission(doctype, "read")
		},
		# The stylesheet Frappe prints with, for print previews in /books
		"print_style": bundled_asset("print.bundle.css"),
	}
