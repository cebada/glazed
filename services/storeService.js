const Store = require('../models/Store');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Order = require('../models/Order');
const {createValidation} = require('../validators/storeValidator');
const {scheduleValidation} = require('../validators/scheduleValidator');

const START_DELIVERY_TIME = "08:00";
const END_DELIVERY_TIME = "22:00";

const createStore = async (req, res) => {
    //TODO use Logs
    //TODO mudar nrs de httpstatus para enum

    // Validate fields in the request body
    const {error} = createValidation(req.body);
    if (error) return res.status(400).json({
        message: error.details[0].message
    });


    // Create a new store
    const store = new Store({
        name: req.body.name
    });

    try {

        // Save the new store in the DB
        const newStore = await store.save();
        return res.status(201).json({
            storeId: newStore._id
        });

    } catch (error) {
        //TODO diferenciar se erro na bd de conexao ou se erro por ja existir user

        //TODO mudar a mensagem de erro para "loja ja existente ou assim"

        // User already exists
        return res.status(400).json({
            message: error
        });
    }
};

const createStoreSchedule = async (req, res) => {

    //TODO deve ser desnecessario pq cadeia de lojas

    // Check if schedule array is provided
    const schedules = req.body.schedules;
    schedules
        ? schedules.forEach(s => {
            // Validate fields in each schedule
            const {error} = scheduleValidation(s);
            if (error) return res.status(400).json({
                message: error.details[0].message
            });
        })
        : res.status(400).json({                                        //TODO not working!
            message: `Please provide the store's schedules!`
        });

    // Array of unique week days
    const uniqueWeekDays = [...new Set(schedules.map(s => s.weekDay))];

    // Check if it's given every day of the week
    if (schedules.length !== 7 ||
        schedules.length !== uniqueWeekDays.length) {
        return res.status(400).json({
            message: `Please provide the correct store's schedules!`
        });
    }

    try {
        for (const s of schedules) {
            const correctedHours = correctScheduleHours(s);
            const schedule = new Schedule({
                weekDay: s.weekDay,
                capacity: s.capacity,
                openingHour: correctedHours.get('openingHour'),
                closingHour: correctedHours.get('closingHour'),
                storeId: req.params.id
            });
            await schedule.save();
        }

        return res.status(201).json({
            message: `Created the store's schedule!`
        });
    } catch (error) {
        return res.status(400).json({
            message: error
        });
    }
}

/*
const createSlots = async (openingHour, closingHour, scheduleId) => {
    let slots = [];
    let initialTime = START_DELIVERY_TIME > openingHour ? START_DELIVERY_TIME : openingHour;
    let endTime = END_DELIVERY_TIME < closingHour ? END_DELIVERY_TIME : closingHour;

    // No slot for the first half an hour
    initialTime = nextSlotTime(initialTime);

    try {
        while (initialTime <= endTime) {
            const slot = new Slot({
                //startTime:
                endTime: initialTime,
                scheduleId: scheduleId
            });
            await slot.save();
            slots.push(slot);
            initialTime = nextSlotTime(initialTime);
        }
        return slots;
    } catch (error) {
        return res.status(400).json({
            message: error
        });
    }

}*/

const correctScheduleHours = schedule => {
    let hours = new Map();

    if (schedule.openingHour === schedule.closingHour){
        hours.set('openingHour', '00:00');
        hours.set('closingHour', '00:00');
    } else {
        if (schedule.openingHour > schedule.closingHour){
            hours.set('openingHour', schedule.closingHour);
            hours.set('closingHour', schedule.openingHour);
        } else {
            hours.set('openingHour', schedule.openingHour);
            hours.set('closingHour', schedule.closingHour);
        }
    }
    return hours;
}

/**
 * Increment the given time by half an hour
 * @param initialTime Time to be incremented
 * @returns {string} Incremented time
 */
const nextSlotTime = initialTime => {
    let hour = initialTime.split(':')[0];
    let minute = initialTime.split(':')[1];
    if (minute === '30') {
        hour++;
        if (hour < '10') hour = '0' + hour;
        minute = '00';
    } else {
        minute = '30';
    }
    return hour + ':' + minute;
}

const getStoreSchedule = async (req, res) => {
    try {
        // Get store's schedule
        const schedule = await Schedule.findOne({storeId: req.params.id, weekDay: dayOfTheWeek(req.params.day)});

        if (!schedule) {
            return res.status(404).json({
                message: 'Store not found'
            });
        }

        const slots = await Slot.find({scheduleId: schedule.id});

        //let response = new Map();
        let response = [];

        for (i = 0; i < slots.length; i++){
            const orders = await Order.find({slotId: slots[i]._id, date: req.params.day});
            response.push({
                endTime: slots[i].endTime,
                available: orders.length < schedule.capacity
            });
            //response.set(s, orders.length < schedule.capacity ? 'true' : 'false');
        }

        return res.status(200).json({
           message: response
        });
    } catch (error) {
        return res.status(400).json({
            message: error
        });
    }
}

const dayOfTheWeek = day => {
    try{
        var weekDay = new Date(day);
        switch (weekDay.getDay()){
            case 0:
                return 'Sunday';
            case 1:
                return 'Monday';
            case 2:
                return 'Tuesday';
            case 3:
                return 'Wednesday';
            case 4:
                return 'Thursday';
            case 5:
                return 'Friday';
            case 6:
                return 'Saturday';
            default:
                return '';
        }
    } catch (error) {
        return null;
    }
}

//TODO mensagem de retorno
/*
// Delete slot from schedule
const deleteSlot = slot => {
    slot.orders.forEach(o => {
        try {
            // Remove from the user's order list the id from the order to delete
            const user = User.findById(o.userId);
            user.orders.pull({_id: o._id});
            // Delete the order
            o.delete();
        } catch (error) {
            console.log(error);
        }
    });
}*/

const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find();
        return res.status(200).json({
            stores: stores
        });
    } catch (error) {
        return res.status(404).json({
            message: 'No stores were found!'
        });
    }
}

//TODO verificar se openingHour<closingHour e trocar se necessário

//TODO nao esquecer de remover
const deleteAll = async (req, res) => {
    try {
        await Schedule.deleteMany();
        await Slot.deleteMany();
        return res.status(200).json({
            message: "Deleted!"
        });
    } catch (error) {
        return res.status(400).json({
            message: error
        });
    }


};


module.exports = {createStore,
    createStoreSchedule,
    getStoreSchedule,
    getAllStores,
    deleteAll
};