// Load dependencies
const { expect } = require('chai');
const { accounts, privateKeys, contract, web3 } = require('@openzeppelin/test-environment');

// Import utilities from Test Helpers
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS, MAX_UINT256 } = constants;

// Load compiled artifacts
const LuniverseGluwacoin = contract.fromArtifact('LuniverseGluwacoinMock');

// Start test block
describe('LuniverseGluwacoin', function () {
    const [ deployer, other, another ] = accounts;
    const [ deployer_privateKey, other_privateKey, another_privateKey ] = privateKeys;

    const name = 'LuniverseGluwacoin';
    const symbol = 'LG';
    const decimals = new BN('18');

    const initialGatekeeperCount = new BN('1');

    const amount = new BN('5000');
    const fee = new BN('1');

    const GATEKEEPER_ROLE = web3.utils.soliditySha3('GATEKEEPER_ROLE');

    beforeEach(async function () {
        // Deploy a new LuniverseGluwacoin contract for each test
        this.token = await LuniverseGluwacoin.new({ from : deployer });
    });

    it('initial totalSupply is 0', async function () {
        expect(await this.token.totalSupply()).to.be.bignumber.equal('0');
    });

    /* GatekeeperRole related
    */
    it('initially the gatekeeper count is 1', async function () {
        expect(await this.token.gatekeeperCount()).to.be.bignumber.equal(initialGatekeeperCount);
    });

    it('deployer is a gatekeeper', async function () {
        expect(await this.token.isGatekeeper(deployer)).to.be.equal(true);
    });

    it('other is not a gatekeeper', async function () {
        expect(await this.token.isGatekeeper(other)).to.be.equal(false);
    });

    it('initially other and another is not approved by deployer', async function () {
        expect(await this.token.isCandidateApproved(other, deployer)).to.be.equal(false);
        expect(await this.token.isCandidateApproved(another, deployer)).to.be.equal(false);
    });

    it('gatekeeper can approve a candidate', async function () {
        expect(await this.token.isCandidateApproved(other, deployer)).to.be.equal(false);
        await this.token.approveCandidate(other, { from : deployer });
        expect(await this.token.isCandidateApproved(other, deployer)).to.be.equal(true);
    });

    it('non-gatekeeper cannot approve a candidate', async function () {
        expect(await this.token.isCandidateApproved(other, deployer)).to.be.equal(false);
        await expectRevert(
            this.token.approveCandidate(other, { from : another }),
            'GatekeeperRole: caller does not have the Gatekeeper role'
        );
    });

    it('gatekeeper can add unanimously approved candidate as a gatekeeper', async function () {
        await this.token.approveCandidate(other, { from : deployer });
        expect(await this.token.isCandidateApproved(other, deployer)).to.be.equal(true);
    });

    it('gatekeeper can renounce and become a non-gatekeeper', async function () {
        expect(await this.token.isGatekeeper(deployer)).to.be.equal(true);
        await this.token.renounceGatekeeper({ from : deployer });
        expect(await this.token.isGatekeeper(deployer)).to.be.equal(false);
    });

    it('non-gatekeeper cannot renounce', async function () {
        await expectRevert(
            this.token.renounceGatekeeper({ from : other }),
            'Roles: account does not have role'
        );

    });

    it('gatekeeper can renounce and decrease the gatekeeper count by 1', async function () {
        expect(await this.token.gatekeeperCount()).to.be.bignumber.equal(initialGatekeeperCount);
        await this.token.renounceGatekeeper({ from : deployer });
        expect(await this.token.gatekeeperCount()).to.be.bignumber.equal(initialGatekeeperCount.sub(new BN('1')));
    });
});