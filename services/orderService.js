const Store = require('../models/Store');
const Schedule = require('../models/Schedule');
const Order = require('../models/Order');
const {START_DELIVERY_TIME, END_DELIVERY_TIME} = require('../config/index');
const {orderValidation} = require('../validators/orderValidator');
const {nextSlotTime} = require("./utils");
const {dayOfTheWeek} = require('./utils');


const createOrder = async (req, res) => {

    // Validate fields in the request body
    const {error} = orderValidation(req.body);
    if (error) return res.status(400).json({
        error: error.details[0].message
    });

    let store;
    try {
        store = await Store.findById(req.body.storeId);
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
                storeId: req.body.storeId,
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

const cancelOrder = async (req, res) => {

    try {
        const order = await Order.deleteOne({
            _id: req.params.id,
            userId: req.user.id
        });
        return res.status(200).json({
            message: 'Canceled order!'
        });
    }
    catch (error) {
        return res.status(404).json({
            error: 'Order not found!'
        });
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


module.exports = {
    createOrder,
    cancelOrder
}