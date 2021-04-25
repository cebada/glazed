const Store = require('../models/Store');
const Schedule = require('../models/Schedule');
const Order = require('../models/Order');
const {createValidation} = require('../validators/storeValidator');
const {scheduleValidation} = require('../validators/scheduleValidator');
const {orderValidation} = require('../validators/orderValidator');
const {updateScheduleValidation} = require('../validators/updateScheduleValidator');

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
            const correctedHours = correctScheduleHours(s.openingHour, s.closingHour);
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

const fillAvailability = (openingHour, closingHour) => {
    let slots = [];
    let initialTime = START_DELIVERY_TIME > openingHour ? START_DELIVERY_TIME : openingHour;
    let endTime = END_DELIVERY_TIME < closingHour ? END_DELIVERY_TIME : closingHour;

    // No slot for the first half an hour
    initialTime = nextSlotTime(initialTime);

    while (initialTime <= endTime) {
        slots.push(initialTime);
        initialTime = nextSlotTime(initialTime);
    }
    return slots;
};

const correctScheduleHours = (openingHour, closingHour) => {
    let hours = new Map();

    if (openingHour === closingHour) {
        hours.set('openingHour', '00:00');
        hours.set('closingHour', '00:00');
    } else {
        if (openingHour > closingHour) {
            hours.set('openingHour', closingHour);
            hours.set('closingHour', openingHour);
        } else {
            hours.set('openingHour', openingHour);
            hours.set('closingHour', closingHour);
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
};

const getStoreAvailability = async (req, res) => {

    const weekDay = dayOfTheWeek(req.params.date);
    if (!weekDay) {
        return res.status(400).json({
            message: 'Invalid date!'
        });
    }

    try {
        // Get store's schedule
        const schedule = await Schedule.findOne({storeId: req.params.id, weekDay: weekDay});

        // Get orders for that day
        const orders = await Order.find({scheduleId: schedule._id, date: req.params.date}).sort({time: 1});

        let availableTime = [];
        if (orders.length === 0) {
            availableTime = fillAvailability(schedule.openingHour, schedule.closingHour);
            return res.status(200).json({
                availableTime: availableTime
            });
        }

        // Check if each 30 minute slot is available
        let orderCount = 0;
        let orderTime = orders[0].time;
        let lastOrder;
        orders.forEach(o => {
            if (o.time !== orderTime) {
                if (orderCount < schedule.capacity) availableTime.push(o.time);
                ordercount = 0;
                orderTime = o.time;
            }
            orderCount++;
            lastOrder = o;
        });
        // Check final order in the
        if (orderCount < schedule.capacity) availableTime.push(lastOrder.time);


        return res.status(200).json({
            availableTime: availableTime
        });
    } catch (error) {
        return res.status(404).json({
            message: 'Schedule not found'
        });
    }
};

const dayOfTheWeek = day => {
    try {
        var weekDay = new Date(day);
        switch (weekDay.getDay()) {
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
};

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
};

const createOrder = async (req, res) => {

    // Validate fields in the request body
    const {error} = orderValidation(req.body);
    if (error) return res.status(400).json({
        error: error.details[0].message
    });

    let store;
    try {
        store = await Store.findById(req.params.id);
    } catch (error) {
        return res.status(404).json({
            error: 'Store not found!'
        });
    }

    try {
        const schedule = await Schedule.findOne({ weekDay: dayOfTheWeek(req.body.date), storeId: store._id });
        if (!isValidTime(req.body.time, schedule)) {
            return res.status(400).json({
                error: 'Choose a valid time slot!'
            });
        }

        const orders = await Order.find({
            scheduleId: schedule._id,
            date: req.body.date,
            time: req.body.time
        });
        if (orders.length < schedule.capacity) {
            const newOrder = new Order({
                userId: req.user.id,
                storeId: req.params.id,
                scheduleId: req.body.scheduleId,
                date: req.body.date,
                time: req.body.time
            });
            await newOrder.save();
            return res.status(201).json({
                orderId: newOrder._id
            });
        } else {
            res.status(400).json({
                error: `Can't create order due to the store's capacity!`
            })
        }
    } catch (error) {
        return res.status(400).json({
            error: 'Bad Request!'
        })
    }
};

const isValidTime = (time, schedule) => {

    const initialTime = START_DELIVERY_TIME > nextSlotTime(schedule.openingHour)
        ? START_DELIVERY_TIME
        : nextSlotTime(schedule.openingHour);
    const endTime = END_DELIVERY_TIME < schedule.closingHour
        ? END_DELIVERY_TIME
        : schedule.closingHour;

    return time >= initialTime && time <= endTime;

};

const updateSchedule = async (req, res) => {

    // Validate fields in the request body
    const {error} = updateScheduleValidation(req.body);
    if (error) return res.status(400).json({
        error: error.details[0].message
    });

    const hours = correctScheduleHours(req.body.openingHour, req.body.closingHour);
    const initialTime = START_DELIVERY_TIME > nextSlotTime(hours.get('openingHour'))
        ? START_DELIVERY_TIME
        : nextSlotTime(hours.get('openingHour'));
    const endTime = END_DELIVERY_TIME < hours.get('closingHour')
        ? END_DELIVERY_TIME
        : hours.get('closingHour');

    const today = getCurrentDate();

    let schedule;
    try {
        schedule = await Schedule.findByIdAndUpdate(req.params.sId, req.body);
    } catch (error) {
        return res.status(404).json({
            error: 'Schedule not found!'
        });
    }

    try {

        if (initialTime >= endTime) {
            await Order.deleteMany({
                scheduleId: schedule._id,
                date: { $gt: today }
            });
        }
        else{
            await Order.deleteMany({
                scheduleId: schedule._id,
                $or : [
                    {time: { $lt: initialTime }},
                    {time: { $gt: endTime }},
                ],
                date: { $gt: today }
            });
        }
        return res.status(200).json({
            message: 'Updated the schedule!'
        });

    } catch (error) {
        return res.status(400).json({
            error: error
        });
    }
};

const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const m = date.getMonth() + 1;
    const month = m < 10 ? '0' + m : m;

    return date.getFullYear() + '-' + month + '-' + day;
};

//TODO verificar se openingHour<closingHour e trocar se necessário

//TODO nao esquecer de remover
const deleteAll = async (req, res) => {
    try {
        await Schedule.deleteMany();
        return res.status(200).json({
            message: "Deleted!"
        });
    } catch (error) {
        return res.status(400).json({
            message: error
        });
    }

};


module.exports = {
    createStore,
    createStoreSchedule,
    getStoreAvailability,
    getAllStores,
    createOrder,
    updateSchedule,
    deleteAll
};