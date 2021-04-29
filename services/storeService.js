const Store = require('../models/Store');
const Schedule = require('../models/Schedule');
const Order = require('../models/Order');
const {START_DELIVERY_TIME, END_DELIVERY_TIME} = require('../config/index');
const {getCurrentDate} = require("./utils");
const {nextSlotTime} = require("./utils");
const {dayOfTheWeek} = require("./utils");
const {createValidation} = require('../validators/storeValidator');
const {scheduleValidation} = require('../validators/scheduleValidator');
const {updateScheduleValidation} = require('../validators/updateScheduleValidator');


/**
 * Creates a new Store
 * @param req Request with the new store body
 * @param res Response
 * @returns {Promise<*>} Created if success, else Bad Request
 */
const createStore = async (req, res) => {

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
        // User already exists
        return res.status(400).json({
            message: error
        });
    }
};

/**
 * Creates a store's schedule (To keep the store close, equal the openingHour and closingHour values)
 * @param req Request with the array of Schedules to create
 * @param res Response
 * @returns {Promise<*>} Created if success, else Bad Request
 */
const createStoreSchedule = async (req, res) => {

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
        : res.status(400).json({
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

/**
 * Returns every possible order time between two given hours
 * @param openingHour Starting hour
 * @param closingHour Final hour
 * @returns {*[]} Returns an array of possible order times
 */
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


/**
 * Checks two given times and corrects them so the openingHour is always before the closingHour (both values = 00:00 when the store is closed)
 * @param openingHour Given openingHour
 * @param closingHour Given closingHour
 * @returns {Map<any, any>} Returns a map with the correct opening and closing hours
 */
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
};

/**
 * Checks for available time slots for orders in a given day for a store
 * @param req Request with the body with storeId and date to check
 * @param res Response
 * @returns {Promise<*>} Returns an array with the still available slots for that day
 */
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

/**
 * Gets all existing stores
 * @param req Request
 * @param res Response
 * @returns {Promise<*>} Returns an array of stores with their full info
 */
const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find();
        const schedules = await Schedule.find();
        let fullInfoStores = [];
        stores.forEach(s => {
            fullInfoStores.push({
                id: s.id,
                name: s.name,
                schedules: schedules.filter((sch) => sch.storeId === s.id)
            });

        });
        return res.status(200).json({
            stores: fullInfoStores
        });
    } catch (error) {
        return res.status(404).json({
            message: 'No stores were found!'
        });
    }
};

/**
 * Updates a store's schedule for a given day
 * @param req Request body
 * @param res
 * @returns {Promise<*>}
 */
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
                date: {$gt: today}
            });
        } else {
            await Order.deleteMany({
                scheduleId: schedule._id,
                $or: [
                    {time: {$lt: initialTime}},
                    {time: {$gt: endTime}},
                ],
                date: {$gt: today}
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


module.exports = {
    createStore,
    createStoreSchedule,
    getStoreAvailability,
    getAllStores,
    updateSchedule
};