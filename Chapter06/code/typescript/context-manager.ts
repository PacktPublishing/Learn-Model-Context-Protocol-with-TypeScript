
interface ContextManager {
    enter(): Generator<any, void, unknown>;
    exit(): void;
}

class DBManager implements ContextManager {
    *enter () {
        console.log("setting up Database");
        yield { "db" : new DB() }
        // TODO: set up DB
    }
    exit() {
        console.log("cleaning up Database")
    }
}

class DB {
    name: string;
    constructor() {
        this.name = "I'm a database";
    }
}

function With(manager: ContextManager, fn: (assets: { [key: string]: any }) => void) {
    const iterator = manager.enter();
    const { value } = iterator.next();
   
    try {
        fn(value);
    } catch (e) {
        console.error("Error occurred:", e);
    } finally {
        iterator.return?.();
        manager.exit();
    }
}


With(new DBManager(), (assets) => {
    console.log("assets:", assets); // assets you get from the context manager
    if (assets.db) {
        if (assets.db instanceof DB) {
            console.log("db is an instance of DB");
        }
    }

    console.log("inside context");
    
    throw Error("throw error");
})

// npm run build && npm start