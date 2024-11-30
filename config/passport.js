const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET;

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
            try {
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) return done(null, false, { message: "User not found" });

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) return done(null, false, { message: "Incorrect password" });

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );

    passport.use(
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: jwtSecret,
            },
            async (jwtPayload, done) => {
                try {
                    const user = await prisma.user.findUnique({ where: { id: parseInt(jwtPayload.userId) } });
                    if (user) return done(null, { userId: user.id });
                    else return done(null, false);
                } catch (error) {
                    return done(error, false);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id } });
            if (!user) return done(null, false);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};
