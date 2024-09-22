const { User } = require('../models')
const { signToken, AuthenticationError } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                return User.findOne({ _id: context.user._id })
            }
            throw AuthenticationError
        }
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password })
            const token = signToken(user)

            return { token, user }
        },
        loginUser: async (parent, { email, password }) => {
            const user = await User.findOne({ email })

            if(!user) {
                throw AuthenticationError
            }

            const correctPw = await user.isCorrectPassword(password)

            if(!correctPw) {
                throw AuthenticationError
            }

            const token = signToken(user)
            return { token, user }
        },
        saveBook: async (parent, { userId, book }, context) => {
            if(context.user) {
                return User.findOneAndUpdate(
                    { _id: userId },
                    {
                        $addToSet: { savedBooks: book }
                    },
                    {
                        new: true,
                        runValidators: true
                    }
                )
            }
            throw AuthenticationError
        },
        removeBook: async (parent, { book }, context) => {
            if(context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user.id },
                    { $pull: { savedBooks: book } },
                    { new: true }
                )
            }
            throw AuthenticationError
        }
    }
}

module.exports = resolvers