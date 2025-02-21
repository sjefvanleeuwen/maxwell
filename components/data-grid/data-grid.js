class DataGrid extends HTMLElement {
    constructor() {
        super();
        this.data = { 
            headers: [], 
            columns: [], // New: column definitions
            rows: [] 
        };
        this.templateUrl = new URL('./template.html', import.meta.url);
        this.template = '';
        this.loadTemplate();
    }

    static get observedAttributes() {
        return ['data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data') {
            try {
                this.data = JSON.parse(newValue);
                this.render();
            } catch (e) {
                console.error('Invalid data format', e);
            }
        }
    }

    async loadTemplate() {
        try {
            const response = await fetch(this.templateUrl);
            this.template = await response.text();
            this.render();
        } catch (e) {
            console.error('Failed to load template:', e);
        }
    }

    setData(data) {
        // Add default column types if not specified
        if (!data.columns) {
            data.columns = data.headers.map(() => ({ type: 'text' }));
        }
        this.data = data;
        this.render();
    }

    formatCell(value, column, index) {
        if (!column || !column.type) return value;

        switch (column.type) {
            case 'image':
                return `<img src="${value}" alt="${column.alt || ''}" style="height: ${column.height || '32px'}; width: ${column.width || 'auto'};">`;
            default:
                return value;
        }
    }

    render() {
        if (!this.template) return;
        const rendered = new Function('return `' + this.template + '`').call(this);
        this.innerHTML = rendered;
    }
}

customElements.define('data-grid', DataGrid);
