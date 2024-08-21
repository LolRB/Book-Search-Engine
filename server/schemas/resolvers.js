const resolvers = {
  Query: {
      me: async (parent, args, context) => {
          if (context.user) {
              const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');

              return userData;
          }

          throw AuthenticationError;
      },
  },
  Mutation: {
      loginUser: async (parent, { email, password }) => {
          const user = await User.findOne({ email });
          const correctPass = await User.isCorrectPassword(password);
          const token = signToken(user);

          if (!user) {
              throw AuthenticationError
          }
          if (!correctPass) {
              throw AuthenticationError
          }

          return { token, user };
      },
      addUser: async (parent, { username, email, password }) => {
          const user = await User.create({ username, email, password });
          const token = signToken(user);

          return { token, user };
      },
      saveBook: async (parent, { userId, bookData }, context) => {
          if (context.user) {
              return User.findOneAndUpdate(
                  { _id: userId },
                  { $addToSet: { savedBooks: bookData } },
                  { new: true }
              );
          }
      },
      removeBook: async (parent, { bookId }, context) => {
          if (context.user) {
              return User.findOneAndUpdate(
                  { _id: context.user._id },
                  { $pull: { savedBooks: { bookId } } },
                  { new: true }
              );
          }
          throw AuthenticationError;
      },
  }
};