import { auth } from '../utils/auth.ts'

export const SingUpBetter = async (req, res) => {
    const results = await auth.api.signUpEmail({
        body: {
            name: req.body.name, // required, The name of the user.
            email: req.body.email, // required, The email address of the user.
            password: req.body.password, // required, The password of the user. It should be at least 8 characters long and max 128 by default.
            image: req.body.image || '', // An optional profile image of the user.
            callbackURL: "http://localhost:3001/accesos", // An optional URL to redirect to after the user signs up.
        },
    })

    if(!results){
        return res.status(500).json({message : "Ocurrió un Error al Crear tu cuenta"})
    }

    return res.status(201).json({message: "Cuenta creada con exito"})
};

export const SingOutBetter = async (req,res) => {

};