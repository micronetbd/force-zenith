class localMsgStore {
    constructor(name, hardcode) {
        this.name = name;
        this.data = [];
        this.default = hardcode;
        this.init()
    }
    init() {
        let condition = localStorage.getItem(this.name);
        this.getAll();
        if (condition) return;
        this.data = this.default;
        this.update();
    }
    getAll() {
        this.data = localStorage.getItem(this.name);
        this.data = JSON.parse(this.data);
        return this.data
    };
    update() {
        localStorage.setItem(this.name, JSON.stringify(this.data));
        this.getAll();
    };
    set(id, value) {
        this.data[id] = value;
        this.update();
    }
    get(id) {
        return this.data[id];
    };
    remove(value) {
        let i = this.data.indexOf(value);
        this.data.splice(i, 1);
        this.update();
    };
    add(value) {
        this.data.push(value);
        this.update();
    };
    addMany(array) {
        this.data.join(array);
        this.update()
    };
    removeMany(array) {
        array.forEach((element) => {
            this.remove(element)
        })
        this.update();
    }
    filter(keysExact, valuesExact) {
        return this.data.filter((item) =>
            keysExact.every((a) => { 
                valuesExact.includes(item[a]) 
            })
        );
    }
    removeAll() {
        this.data = [];
        this.update();
    };
};