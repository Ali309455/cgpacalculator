import mongoose from "mongoose";

const FormulaSchema = new mongoose.Schema({
    sessionalsWeight: Number,
    finalWeight: Number,
    gradeBoundaries: [
        {
            grade: String,
            minPercentage: Number,
            maxPercentage: Number,
            gpa: Number
        }
    ]
});

export default mongoose.models.Formula || mongoose.model("Formula", FormulaSchema);