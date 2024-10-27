const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SocialsSchema = new Schema(
    {
        info: [
            {
                pageID: {
                    type: String,
                    required: true,
                },
                pageName: {
                    type: String,
                    required: true,
                },
                pageAccessToken: {
                    type: String,
                    required: true,
                },
                userAccessToken: {
                    type: String,
                    required: true,
                },
                botId: {
                    type: String,
                    required: true,
                },
                chatBoxID: {
                    type: String,
                    required: true,
                },
            }
        ],
        type: {
            type: String,
            unique: true,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        startDate: {
            type: Date,
            default: null,
        },
        endDate: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        id: true,
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

SocialsSchema.methods.isOwner = function (userId) {
    return this.owner.equals(userId);
};

module.exports = mongoose.model('Socials', SocialsSchema);
