pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

// SPDX-License-Identifier: MIT OR Apache-2.0

import "@opengsn/contracts/src/forwarder/IForwarder.sol";
import "@opengsn/contracts/src/BasePaymaster.sol";

contract NaivePaymaster is BasePaymaster {
    address public ourTarget; // The target contract we are willing to pay for

    // allow the owner to set ourTarget
    event TargetSet(address target);

    function setTarget(address target) external onlyOwner {
        ourTarget = target;
        emit TargetSet(target);
    }

    event PreRelayed(uint256);
    event PostRelayed(uint256);

    constructor(address target) {
        ourTarget = target;
    }

    function preRelayedCall(
        GsnTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    ) external virtual override returns (bytes memory context, bool) {
        _verifyForwarder(relayRequest);
        (signature, approvalData, maxPossibleGas);

        require(relayRequest.request.to == ourTarget);
        emit PreRelayed(block.timestamp);
        return (abi.encode(block.timestamp), false);
    }

    function postRelayedCall(
        bytes calldata context,
        bool success,
        uint256 gasUseWithoutPost,
        GsnTypes.RelayData calldata relayData
    ) external virtual override {
        (context, success, gasUseWithoutPost, relayData);
        emit PostRelayed(abi.decode(context, (uint256)));
    }

    function versionPaymaster()
        external
        view
        virtual
        override
        returns (string memory)
    {
        return "2.2.0";
    }
}
