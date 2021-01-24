import { ObjectId } from 'mongodb';

const basicUtils = {
  isValidId(id) {
    // Checks if Id is Valid for Mongo
    try {
      ObjectId(id);
    } catch (err) {
      return false;
    }
    return true;
  },
};

export default basicUtils;
