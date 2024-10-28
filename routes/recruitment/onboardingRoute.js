const express = require('express');
const onboardingController = require('../../controllers/recruitment/onboardingController');
const router = express.Router();

router.post('/', onboardingController.createOnboarding);

router.get('/', onboardingController.getAllOnboardings);

router.get('/:id', onboardingController.getOnboardingById);

router.patch('/:id', onboardingController.updateOnboarding);

router.delete('/:id', onboardingController.deleteOnboarding);

module.exports = router;
