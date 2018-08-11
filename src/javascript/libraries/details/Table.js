import CustomElement from "../common/CustomElement.js";

export default class Table extends CustomElement {
	defaultElements() {
		this.base.fragment = this.base.fragment || document.createDocumentFragment();
		this.base.tr = this.base.tr || document.createElement("tr");
		this.base.td = this.base.td || document.createElement("td");
	}

	getRow(cells) {
		const row = this.base.tr.cloneNode();
		let tmp;

		if(typeof cells[Symbol.iterator] === "function")
			for(let cell of cells) {
				tmp = this.base.td.cloneNode();
				tmp.innerHTML = cell;

				row.appendChild(tmp);
			}
			

		return row;
	}

	getRows(table) {
		let fragment = this.base.fragment.cloneNode();

		if(typeof table[Symbol.iterator] === "function")
			for(let row of table) {
				fragment.appendChild(this.getRow(row));
			}
		else
			for(let row in table) {
				fragment.appendChild(this.getRow([row, table[row]]));
			}
		
		return fragment;
	}

	appendTable(table) {
		this.appendElement(this.getRows(table));
	}
}