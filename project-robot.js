const { ObjectFlags } = require("typescript");

const ROADS = [
    "Дом Алисы-Дом Боба", "Дом Алисы-Склад",
    "Дом Алисы-Почта", "Дом Боба-Ратуша",
    "Дом Дарии-Дом Эрни", "Дом Дарии-Ратуша",
    "Дом Эрни-Дом Греты", "Дом Греты-Ферма",
    "Дом Греты-Магазин", "Рынок-Ферма",
    "Рынок-Почта", "Рынок-Магазин",
    "Рынок-Ратуша", "Магазин-Ратуша"    
]

graph = (edges) => {
    let graph = Object.create(null);
    addEdge = (from, to) => {
        if (graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }
    for (let [from, to] of edges.map(r => r.split("-"))) {
        addEdge(from, to)
        addEdge(to, from)
    }
    return graph
}

const roadGraph = graph(ROADS)

class VillageState {
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    move(destination) {
        if (!roadGraph[this.place].includes(destination)){
            return this;
        } else {
            let parcels =this.parcels.map(p => {
                if (p.place != this.place) return p;
                return {place: destination, address: p.address};
            }).filter(p => p.place != p.address);
            return new VillageState(destination, parcels);
        }
    }
}


/* The first moving */
// let first = new VillageState(
//     "Почта", 
//     [{place: "Почта", address: "Дом Алисы"}]
// );
// let next = first.move("Дом Алисы");
// console.log(next.place);
// console.log(next.parcels);
// console.log(first.place);

function runRobot(state, robot, memory){
    for (let turn = 0;; turn++) {
        if (state.parcels.length == 0){
            console.log(`Выполнено за ${turn} ходов`);
            return turn;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Переход в направлении ${action.direction}`);       
    }
}

function randomePick(array){
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

function randomRobot(state) {
    return {direction: randomePick(roadGraph[state.place])}
}

VillageState.random = function(parcelCount = 5){
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomePick(Object.keys(roadGraph));
        let place;
        do {
            place = randomePick(Object.keys(roadGraph));
        } while (place == address)
        parcels.push({place, address});
    return new VillageState("Почта", parcels);
    }
}
/* Randome path */
// runRobot(VillageState.random(), randomRobot);

const mailRoute = [
    "Дом Алисы", "Склад", "Дом Алисы", "Дом Боба", 
    "Ратуша", "Дом Дарии", "Дом Эрни",
    "Дом Греты", "Магазин", "Дом Греты", "Ферма",
    "Рынок", "Почта"
]

function routeRobot(state, memory){
    if (memory.length == 0){
        memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
}

/* Truck */
// runRobot(VillageState.random(), routeRobot, mailRoute);

function findRoute(graph, from, to) {
    let work = [{at: from, route:[]}];
    for (let i = 0; i < work.length; i++) {
        let {at, route} = work[i];
        for (let place of graph[at]){
            if (place == to) return route.concat(place);
            if (!work.some(w => w.at == place)) {
                work.push({at: place, route: route.concat(place)});
            }
        } 
    }
}

function goalOrientedRobot({place, parcels}, route){
    if (route.length == 0){
        let parcel = parcels[0];
        if (parcel.place != place){
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)}
}

/* Graph oriented robot */
//runRobot(VillageState.random(), goalOrientedRobot, []);

/* Compare robots */
function compareRobots(RobotOne = {robot:new Function(), memory:[]}
                     , RobotTwo = {robot:new Function(), memory:[]}){
    let sumRobotOne = 0;
    let sumRobotTwo = 0;
    for (let i = 0; i < 100; i++) {
        randomPlace = VillageState.random();
        sumRobotOne += runRobot(randomPlace, RobotOne.robot, RobotOne.memory)
        sumRobotTwo += runRobot(randomPlace, RobotTwo.robot, RobotTwo.memory)
    }
    console.log(`\nRobot 1 - ${sumRobotOne/100} \nRobot 2 - ${sumRobotTwo/100}`)
}

compareRobots({robot:routeRobot, memory:mailRoute}
            , {robot:goalOrientedRobot, memory:[]})