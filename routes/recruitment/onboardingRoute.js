const express = require('express');
const onboardingController = require('../../controllers/recruitment/onboardingController');
const router = express.Router();

// Route to create an onboarding record
router.post('/', onboardingController.createOnboarding);

// Route to get all onboarding records
router.get('/', onboardingController.getAllOnboardings);

// Route to get a specific onboarding record by ID
router.get('/:id', onboardingController.getOnboardingById);

// Route to update an onboarding record
router.patch('/:id', onboardingController.updateOnboarding);

// Route to delete an onboarding record
router.delete('/:id', onboardingController.deleteOnboarding);

module.exports = router;
