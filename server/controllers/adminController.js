import Court from "../models/Court.js";
import User from "../models/User.js";
import Request from "../models/Request.js";
import { responseHelper } from "../utils/responseHelper.js";

export const getAllOfficers = async (req, res) => {
    try {
        const officers = await User.find({ role: "officer" })
            .select("-password")
            .populate("courtId", "name location")
            .sort({ createdAt: -1 });

        return responseHelper.success(res, "Officers fetched successfully", { officers });
    } catch (error) {
        return responseHelper.error(res, "Failed to fetch officers", 500, error.message);
    }
};

export const getAllReaders = async (req, res) => {
    try {
        const readers = await User.find({ role: "reader" })
            .select("-password")
            .populate("courtId", "name location")
            .sort({ createdAt: -1 });

        return responseHelper.success(res, "Readers fetched successfully", { readers });
    }
    catch (error) {
        return responseHelper.error(res, "Failed to fetch readers", 500, error.message);
    }
};

export const getAllCourts = async (req, res) => {
    try {
        const courts = await Court.find().select("name location").sort({ name: 1 });
        return responseHelper.success(res, "Courts fetched successfully", { courts });
    }
    catch (error) {
        return responseHelper.error(res, "Failed to fetch courts", 500, error.message);
    }
};


export const getAdminDashboardDetails = async (req, res) => {
    try {
        const [courtCount, officerCount, readerCount, documentCount] = await Promise.all([
            Court.countDocuments(),
            User.countDocuments({ role: "officer" }),
            User.countDocuments({ role: "reader" }),
            Request.countDocuments(),
        ]);

        return responseHelper.success(res, "Admin dashboard details fetched successfully", {
            courtCount,
            officerCount,
            readerCount,
            documentCount,
        });
    } catch (error) {
        return responseHelper.error(res, "Failed to fetch admin dashboard details", 500, error.message);
    }
};

export const handleCreateUser = async (req, res) => {
    try {
        const { name, email, password, role, courtId } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return responseHelper.error(res, "A user with this email already exists", 400);
        }

        const courtRecord = await Court.findById(courtId).select("_id name");
        if (!courtRecord) {
            return responseHelper.error(res, "Selected court not found", 404);
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role,
            courtId: courtRecord._id,
        });

        const user = await User.findById(newUser._id)
            .select("-password")
            .populate("courtId", "name");

        return responseHelper.success(res, "User created successfully", { user });
    } catch (error) {
        return responseHelper.error(res, "Failed to create user", 500, error.message);
    }
};

export const handleAddCourt = async (req, res) => {
    console.log("Req recieved");
    try {
        const { name, location } = req.body;

        const existingCourt = await Court.findOne({ name, location });
        if (existingCourt) {
            return responseHelper.error(res, "A court with this name already exists", 400);
        }
        
        console.log(name, location);
        const newCourt = await Court.create({ name, location });
        return responseHelper.success(res, "Court added successfully", { court: newCourt });
    } catch (error) {
        console.log(error.message);
        return responseHelper.error(res, "Failed to add court", 500, error.message);
    }
}

export const handleDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return responseHelper.notFound(res, "User");
        }

        if (user.role === "admin") {
            return responseHelper.forbidden(res, "Admin users cannot be deleted here.");
        }

        await User.findByIdAndDelete(id);
        return responseHelper.success(res, "User deleted successfully");
    } catch (error) {
        return responseHelper.error(res, "Failed to delete user", 500, error.message);
    }
};

export const handleDeleteCourt = async (req, res) => {
    try {
        const { id } = req.params;
        const court = await Court.findById(id);

        if (!court) {
            return responseHelper.notFound(res, "Court");
        }

        await Court.findByIdAndDelete(id);
        return responseHelper.success(res, "Court deleted successfully");
    } catch (error) {
        return responseHelper.error(res, "Failed to delete court", 500, error.message);
    }
};

export const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .populate("details.courtId", "name location")
            .populate("readerId", "name email")
            .populate("assignedOfficerId", "name email")
            .sort({ createdAt: -1 });

        return responseHelper.success(res, "Requests fetched successfully", { requests });
    } catch (error) {
        return responseHelper.error(res, "Failed to fetch requests", 500, error.message);
    }
};
