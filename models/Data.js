// models/Result.js

const DataSchema = new mongoose.Schema({
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
},
  courses: [
    {
      name: String,
      creditHours: Number,
      marks: {
        sessional: { midsem: Number, others: Number },
        final: Number,
      },
    },
  ],
});

export default mongoose.models.Data || mongoose.model("Data", DataSchema);
