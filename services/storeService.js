const Store = require('../models/Store');
const { createValidation } = require('../validators/storeValidator');
const User = require('../models/User');

const START_DELIVERY_TIME = "08:00";
const ENd_DELIVERY_TIME = "22:00";

const createStore = async (req, res) => {
    //TODO use Logs
    //TODO mudar nrs de httpstatus para enum

    // Validate fields in the request body
    const {error} = createValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);


    // Create a new store
    const store = new Store({
        name: req.body.name,
        ownerId: req.user.id
    });

    try {

        // Save the new store in the DB
        const newStore = await store.save();
        res.send({storeId: newStore._id});

    }catch (error) {
        //TODO diferenciar se erro na bd de conexao ou se erro por ja existir user

        //TODO mudar a mensagem de erro para "loja ja existente ou assim"

        // User already exists
        res.status(400)
            .send(error);
    }
};

const createSlots = schedule => {
    let slots = [];
    let initialTime = START_DELIVERY_TIME > schedule.openingHour ? START_DELIVERY_TIME : schedule.openingHour;
    let endTime = ENd_DELIVERY_TIME < schedule.closingHour ? ENd_DELIVERY_TIME : schedule.closingHour;

    while (initialTime !== endTime) {
        const slot = new Slot({
            scheduleId: schedule._id,
            //startTime:
            endTime: slotTime
        });
        slots.push(slot);
        slotTime = nextSlotTime(slotTime);
    }
    return slots;
}

// Add half an hour to the time
const nextSlotTime = initialTime => {
    let hour = initialTime.split(':')[0];
    let minute = initialTime.split(':')[1];
    if (minute === '30') {
        hour++;
        minute = '00';
    } else {
        minute = '30';
    }
    return hour + ':' + minute;
}

// Delete slot from schedule
const deleteSlot = slot => {
    slot.orders.forEach( o => {
        try {
            // Remove from the user's order list the id from the order to delete
            const user = User.findById(o.userId);
            user.orders.pull({_id: o._id});
            // Delete the order
            o.delete();
        }catch (error){
            console.log(error);
        }
    });
}

//TODO verificar se openingHour<closingHour e trocar se necessário


module.exports = { createStore };