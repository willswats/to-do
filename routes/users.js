const express = require('express')
const router = express.Router()
const passport = require('passport')

const User = require('../models/user')
const ToDo = require('../models/todo');
const catchAsync = require('../utils/catchAsync')

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', `Successfully logged in user ${registeredUser.username}! `)
            res.redirect('/todo')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}))

router.post('/registerguest', catchAsync(async (req, res) => {
    try {
        if (req.user) {
            req.flash('error', 'You are already signed in to an account!')
            return res.redirect('/')
        }
        const rand = Math.floor(Math.random() * 1000000000000000000000)
        const email = `${rand}@${rand}`
        const username = `${rand}`
        const password = `${rand}`
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', `Successfully logged in guest user ${registeredUser.username}! `)
            req.flash('error', 'This is a guest account, to save your To Do List please register your own account.')
            res.redirect('/todo')
        })
    }
    catch (e) {
        req.flash('error', e.message)
        res.redirect('/')
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', `Welcome back user ${req.user.username}`)
    res.redirect('/todo')
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', `Successfully logged out!`)
    res.redirect('/')
})

router.delete('/deleteaccount', catchAsync(async (req, res) => {
    try {
        const { id } = req.user
        await ToDo.deleteMany({ author: id })
        await User.findByIdAndDelete(id)
        req.flash('success', `Successfully deleted account!`)
        res.redirect('/')
    }
    catch (e) {
        req.flash('error', e.message)
        res.redirect('/')
    }
}))

module.exports = router;