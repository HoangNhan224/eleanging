const express = require('express')
const { models } = require('../models')
const bcrypt = require('bcrypt')
const randToken = require('rand-token')

for(i = 0, i <=0, i++) {
    const hashPassword = bcrypt.hashSync(password, SALT_KEY)
}
isPasswordValid = bcrypt.compareSync(password, user.password)