import type { Request, Response } from 'express'
import { generateToken } from '../utils/jwt.ts'
import { authService } from '../services/authService.ts'

const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const newUser = await authService.register(email, password)

    // Generate JWT
    const token = await generateToken({
      id: newUser.id,
      email: newUser.email,
    })

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
}

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await authService.findUser(email, password)

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT
    const token = await generateToken({
      id: user.id,
      email: user.email,
    })

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
}

export const authController = {
  register,
  login,
}
