import mongoose, { Schema, Model, Document } from "mongoose";

/* ------------------------------------------------------------------ */
/* 1. Content Block Schema                                            */
/* ------------------------------------------------------------------ */
const contentBlockSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["paragraph", "heading", "image", "list", "pdf", "video", "quote", "link"],
            required: true,
        },
        content: Schema.Types.Mixed,
        order: Number,
    },
    { _id: false }
);

/* ------------------------------------------------------------------ */
/* 2. Base Schema                                                     */
/* ------------------------------------------------------------------ */
const baseOptions = {
    discriminatorKey: "category",
    collection: "archive_items",
    timestamps: true,
};

export interface IArchiveItem extends Document {
    title: string;
    slug: string;
    thumbnail?: string;
    author?: mongoose.Types.ObjectId;
    category: string;
    bodyContent: { type: string; content: unknown; order: number }[];
    tags?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // discriminator fields
}

const BaseSchema = new Schema<IArchiveItem>(
    {
        title: { type: String, required: true, index: true },
        slug: { type: String, required: true, unique: true },
        thumbnail: { type: String },
        author: { type: Schema.Types.ObjectId, ref: "User" },
        category: { type: String, required: true, index: true },
        bodyContent: [contentBlockSchema],
        tags: [String],
    },
    baseOptions
);

BaseSchema.index({ title: "text", tags: "text", slug: "text", category: "text" });

/* ------------------------------------------------------------------ */
/* 3. Shared field mixins                                             */
/* ------------------------------------------------------------------ */
const LocationSchema = {
    locationLink: { type: String },
    coordinates: { lat: Number, lng: Number },
    address: { type: String },
    contactPhone: { type: String },
};

const PersonFields = {
    dateOfBirth: { type: Date },
    dateOfDeath: { type: Date },
    education: { type: String },
    achievements: [String],
    sectorNo: { type: String },
    passingYear: { type: Number },
    currentStatus: { type: String },
    profession: { type: String },
};

const HeritageFields = {
    period: { type: String },
    significance: { type: String },
};

const NarrativeFields = {
    dateOfIncident: { type: Date },
    involvedParties: [String],
};

const OccupationFields = {
    traditionalName: { type: String },
    toolsUsed: [String],
    occupationStatus: { type: String, enum: ["Thriving", "Declining", "Extinct"] },
};

const OrgFields = {
    foundedBy: { type: String },
    missionStatement: { type: String },
};

/* ------------------------------------------------------------------ */
/* 4. Init helper – ensures discriminators only register once         */
/* ------------------------------------------------------------------ */
function getOrCreateModel(name: string, parent: Model<IArchiveItem>, schemaObj: object): Model<IArchiveItem> {
    if (mongoose.models[name]) return mongoose.models[name] as Model<IArchiveItem>;
    return parent.discriminator<IArchiveItem>(name, new Schema(schemaObj));
}

const ArchiveItem: Model<IArchiveItem> =
    mongoose.models.ArchiveItem || mongoose.model<IArchiveItem>("ArchiveItem", BaseSchema);

const History = getOrCreateModel("history", ArchiveItem, { ...HeritageFields, ...NarrativeFields });
const Culture = getOrCreateModel("culture", ArchiveItem, { ...HeritageFields, ...NarrativeFields });
const NotablePerson = getOrCreateModel("notable people", ArchiveItem, { ...PersonFields });
const FreedomFighter = getOrCreateModel("freedom fighters", ArchiveItem, { ...PersonFields });
const MeritoriousStudent = getOrCreateModel("meritorious student", ArchiveItem, { ...PersonFields });
const HiddenTalent = getOrCreateModel("hidden talent", ArchiveItem, { ...PersonFields });
const Occupation = getOrCreateModel("occupation", ArchiveItem, { ...HeritageFields, ...OccupationFields });
const HeartbreakingStory = getOrCreateModel("Heartbreaking stories", ArchiveItem, { ...NarrativeFields });
const SocialWork = getOrCreateModel("social works", ArchiveItem, { ...LocationSchema, ...OrgFields });

const Institution = getOrCreateModel("institution", ArchiveItem, {
    ...LocationSchema,
    subType: { type: String, enum: ["educational", "governmental", "Banks", "Religious", "other"] },
    establishedDate: { type: Date },
    headOfInstitution: { type: String },
});

const Transport = getOrCreateModel("transport", ArchiveItem, {
    ...LocationSchema,
    transportType: { type: String, enum: ["bus", "train", "auto stand", "launch-ghat"] },
    destinations: [String],
});

const Emergency = getOrCreateModel("Emergency services", ArchiveItem, {
    ...LocationSchema,
    serviceType: { type: String, enum: ["hospitals", "police", "fire"] },
    is24Hours: { type: Boolean, default: true },
});

const TouristSpot = getOrCreateModel("tourist spots", ArchiveItem, {
    ...LocationSchema,
    entryFee: { type: String },
    bestTimeToVisit: { type: String },
});

/* ------------------------------------------------------------------ */
/* 5. Model map (used by admin routes)                                */
/* ------------------------------------------------------------------ */
export const MODEL_MAP: Record<string, Model<IArchiveItem>> = {
    history: History,
    culture: Culture,
    institution: Institution,
    "notable people": NotablePerson,
    "freedom fighters": FreedomFighter,
    "meritorious student": MeritoriousStudent,
    "hidden talent": HiddenTalent,
    occupation: Occupation,
    "Heartbreaking stories": HeartbreakingStory,
    "tourist spots": TouristSpot,
    transport: Transport,
    "Emergency services": Emergency,
    "social works": SocialWork,
    // Slug-friendly aliases
    "notable-people": NotablePerson,
    "freedom-fighters": FreedomFighter,
    "meritorious-student": MeritoriousStudent,
    "hidden-talent": HiddenTalent,
    "heartbreaking-stories": HeartbreakingStory,
    "tourist-spots": TouristSpot,
    "emergency-services": Emergency,
    "social-works": SocialWork,
};

export const SUB_TYPE_MAP: Record<string, { field: string; values: string[] }> = {
    institution: { field: "subType", values: ["educational", "governmental", "Banks", "Religious", "other"] },
    transport: { field: "transportType", values: ["bus", "train", "auto stand", "launch-ghat"] },
    "Emergency services": { field: "serviceType", values: ["hospitals", "police", "fire"] },
};

export {
    ArchiveItem,
    History,
    Culture,
    NotablePerson,
    FreedomFighter,
    MeritoriousStudent,
    HiddenTalent,
    Occupation,
    HeartbreakingStory,
    SocialWork,
    Institution,
    Transport,
    Emergency,
    TouristSpot,
};
