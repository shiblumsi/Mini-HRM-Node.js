const express = require('express');
const onboardingController = require('../../controllers/recruitment/onboardingController');
const { adminAndHrOnly } = require('../../middlewares/permissionMiddlewar');

const router = express.Router();

router.use(adminAndHrOnly);
router.post('/', onboardingController.createOnboarding);
router.get('/', onboardingController.getAllOnboardings);
router.get('/:id', onboardingController.getOnboardingById);
router.patch('/:id', onboardingController.updateOnboarding);
router.delete('/:id', onboardingController.deleteOnboarding);

module.exports = router;
