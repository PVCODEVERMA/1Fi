const Collateral = require('../models/Collateral');

const addCollateral = async (req, res) => {
  try {
    const { fundName, fundIsin, units, currentNavPerUnit, depositoryReference } = req.body;
    const borrowerId = req.user.userId;

    const totalValue = units * currentNavPerUnit;

    const collateral = new Collateral({
      borrowerId,
      fundName,
      fundIsin,
      units,
      currentNavPerUnit,
      totalValue,
      depositoryReference,
      status: 'active',
    });

    await collateral.save();

    res.status(201).json({
      message: 'Collateral added successfully',
      collateral,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBorrowerCollaterals = async (req, res) => {
  try {
    const borrowerId = req.user.role === 'applicant' ? req.user.userId : req.query.borrowerId;

    const collaterals = await Collateral.find({
      borrowerId,
      isActive: true,
    }).populate('linkedLoanId', 'applicationNumber loanAmount');

    res.json(collaterals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCollateral = async (req, res) => {
  try {
    const { currentNavPerUnit } = req.body;
    const collateral = await Collateral.findById(req.params.id);

    if (!collateral) {
      return res.status(404).json({ error: 'Collateral not found' });
    }

    if (collateral.borrowerId.toString() !== req.user.userId && req.user.role === 'applicant') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    collateral.currentNavPerUnit = currentNavPerUnit;
    collateral.totalValue = collateral.units * currentNavPerUnit;

    await collateral.save();

    res.json({
      message: 'Collateral updated successfully',
      collateral,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeCollateral = async (req, res) => {
  try {
    const collateral = await Collateral.findById(req.params.id);

    if (!collateral) {
      return res.status(404).json({ error: 'Collateral not found' });
    }

    if (collateral.linkedLoanId) {
      return res.status(400).json({ error: 'Cannot remove collateral linked to an active loan' });
    }

    collateral.isActive = false;
    await collateral.save();

    res.json({ message: 'Collateral removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addCollateral,
  getBorrowerCollaterals,
  updateCollateral,
  removeCollateral,
};
