# UNITED STATES PATENT AND TRADEMARK OFFICE (USPTO)
# UTILITY PATENT APPLICATION

**Title of the Invention**: SYSTEM AND METHOD FOR INJECTABLE UNIVERSAL TRANSACTION FRAMES WITH AGNOSTIC DUAL-RAIL ROUTING  
**Inventor(s)**: Eraycan Merih

---

## CROSS-REFERENCE TO RELATED APPLICATIONS
Not Applicable.

## STATEMENT REGARDING FEDERALLY SPONSORED RESEARCH OR DEVELOPMENT
Not Applicable.

## BACKGROUND OF THE INVENTION

### 1. Field of the Invention
The present invention relates generally to the field of financial technology, distributed ledger technologies (DLT), client-side web architecture, and e-commerce. More specifically, the present invention relates to systems and methods for deploying interactive, executable transaction interfaces that are visually injected directly into disparate third-party host environments (including but not limited to: web browsers, mobile applications, social media feeds, decentralized social networking protocols, interactive blogs, messaging applications, content management systems, and virtual/augmented reality user interfaces) and utilizing deterministic agnostic routing to execute non-custodial transactions over a plurality of settlement rails.

### 2. Description of the Related Art
In the current state of the art, e-commerce transactions originating from social media feeds, third-party content platforms, or messaging applications typically require redirecting a user away from the host environment to a dedicated, disparate checkout domain. This context-switching results in significant drop-off rates, friction, and a fragmented user experience. While some platforms have introduced native, in-feed shopping integrations, such systems remain heavily siloed, proprietary, and fundamentally incompatible with decentralized cryptographic networks (blockchains) or universal, cross-platform deployment. 

Furthermore, existing payment gateways require a rigid coupling between the front-end user interface and the back-end settlement network, forcing merchants to choose between centralized fiat payment processors (which carry high custodial risk and centralization) or decentralized cryptographic rails (which lack mainstream fiat accessibility). There exists a critical need for an architecture capable of injecting executable, highly interactive transaction interfaces directly into third-party host environments that can programmatically construct and route transaction payloads to *any* underlying settlement rail—without requiring the host platform's permission or custody of the underlying funds.

## SUMMARY OF THE INVENTION

The present disclosure provides a system, method, and non-transitory computer-readable medium for deploying interactive, executable transaction frames injected directly into third-party host environments. 

In one embodiment, the system operates by rendering a dynamic Universal Pay Shell (herein referred to as the "Transaction Frame") utilizing metadata unfurling protocols (such as Open Graph tags, `<meta property="fc:frame">`, or native iframe embeds). Upon rendering within the host's client environment, the frame establishes a direct connection to a deterministic routing module. 

When a user interacts with the frame, the routing module dynamically constructs a transaction payload formatted specifically for a selected or algorithmically determined settlement rail (e.g., a serialized blockchain transaction or a fiat payment intent). The transaction is executed at the client layer, completely bypassing the host platform's native monetization constraints and operating in a non-custodial manner.

By structurally decoupling the front-end interface injection from the back-end execution rails, the present invention ensures that the failure, deprecation, or removal of any single settlement network (fiat or cryptographic) does not impede the system's ability to operate and route payloads through alternative networks.

## BRIEF DESCRIPTION OF THE DRAWINGS
*(To be accompanied by formal USPTO line drawings in final filing)*
**FIG. 1** is a block diagram illustrating the overall system architecture, including the remote server, the third-party host environment, the client device, and the plurality of settlement networks.
**FIG. 2** is a flowchart illustrating the method of metadata unfurling and visual injection of the transaction frame.
**FIG. 3** is a flowchart illustrating the deterministic routing logic and payload construction mechanism.
**FIG. 4** is a sequence diagram illustrating the non-custodial atomic fee-splitting settlement execution.

## DETAILED DESCRIPTION OF THE INVENTION

The following detailed description illustrates embodiments of the invention by way of example and not by way of limitation. The system architecture comprises three primary structural components designed to prevent circumvention and enable seamless cross-platform functionality:

### 1. The Injectable Frame Module (Client-Side Interface)
A lightweight, executable graphical user interface (GUI) configured to utilize metadata scraping protocols. The remote server intercepts a web crawler request originating from the third-party host environment and responds with dynamic meta-tags. These tags instruct the third-party host environment to render the executable frame in place of a static hyperlink. The frame acts as a universally portable point-of-sale terminal that executes code natively within the constraints of the host feed.

### 2. The Agnostic Routing Engine (Middleware)
A processing module configured to receive an execution trigger from the Frame. Its primary function is payload construction. The engine determines whether the user is executing via a cryptographic wallet or a traditional fiat card interface. It then constructs the exact deterministic payload (e.g., a serialized `Transaction` object for a decentralized blockchain or a structured initialization token for a centralized gateway) and returns it to the client device.

### 3. The Non-Custodial Settlement Bridge (Execution Layer)
The structural layer where the payload is executed. For decentralized rails, the system passes the payload directly to an injected browser extension (e.g., a cryptographic wallet) for a cryptographic signature. For fiat rails, it triggers a secure, tokenized overlay. In all embodiments, the facilitating platform never holds direct custody of the funds; the transaction routes directly from the buyer to the creator, with an atomic fee split routed to the platform treasury as a mathematical constraint of the payload.

---

## CLAIMS

**What is claimed is:**

**1.** A method for executing platform-agnostic interactive transactions within a third-party host environment, the method comprising:
a) generating, by a remote server, an interactive transaction frame associated with a unique digital product identifier, service identifier, or an abstract zero-knowledge execution intent;
b) serving the interactive transaction frame to a client device rendering the third-party host environment, wherein the interactive transaction frame is visually injected into a content feed of the third-party host environment without redirecting the user;
c) receiving, at the interactive transaction frame, an execution trigger initiated by the user;
d) determining, via a deterministic routing module in communication with the interactive transaction frame, a target execution environment independent of the third-party host environment, wherein the target execution environment comprises a settlement network, an off-chain state channel, a Layer-2 ledger, or a decentralized intent aggregator network;
e) constructing or routing a transaction payload, including but not limited to serialized blockchain transactions, smart contract invocations, off-chain cryptographic state updates, tokenized payment tokens, API intents, or zero-knowledge abstract intents, dynamically formatted for the determined target execution environment;
f) executing the transaction payload directly from the client device, or from an isolated hardware security enclave communicably coupled to the client device, to the target execution environment, thereby bypassing custodial interception by the third-party host environment; and
g) executing the interactive transaction frame natively within a mobile web browser or native mobile application web-view constraint without requiring the installation of an external client-side browser extension or application plugin.

**2.** The method of claim 1, wherein the target execution environment comprises a decentralized cryptographic blockchain network, the method further comprising:
intercepting the constructed transaction payload at the client device; transmitting the constructed transaction payload to a local non-custodial cryptographic wallet residing on the client device for a cryptographic signature; and broadcasting the signed payload to the decentralized cryptographic blockchain network.

**3.** The method of claim 1, wherein the target execution environment comprises a centralized fiat payment gateway, the method further comprising:
transmitting an initialization token to the interactive transaction frame; and rendering a secure, tokenized payment overlay directly over the third-party host environment.

**4.** The method of claim 1, wherein the step of constructing the transaction payload further comprises integrating an atomic fee-splitting instruction into the payload, whereby a predetermined protocol fee is programmatically deducted and routed to a designated treasury address simultaneously with a primary transfer of value to a creator, executing as a single atomic operation on the target execution environment without custodial possession by the remote server.

**5.** The method of claim 1, wherein the step of serving the interactive transaction frame comprises metadata unfurling, whereby the remote server intercepts a web crawler request originating from the third-party host environment and responds with a plurality of dynamic meta-tags that instruct the third-party host environment to render the interactive transaction frame in place of a static hyperlink.

**6.** The method of claim 1, wherein the step of serving the interactive transaction frame comprises a client-side browser script or browser extension injecting the interactive transaction frame directly into a document object model (DOM) of the third-party host environment.

**7.** The method of claim 1, wherein the step of serving the interactive transaction frame comprises a server-side metadata unfurling mechanism configured to render natively within mobile application content feeds, native mobile web-views, and desktop browser environments without external browser plugins.

**8.** The method of claim 1, wherein the remote server generating the interactive transaction frame operates independently of host ownership, whereby the method executes regardless of whether the remote server is operated by an outside independent party or directly by the platform governing the third-party host environment.

**9.** The method of claim 1, wherein the step of executing the transaction payload is facilitated by an operating system universal link or deep link protocol triggering a tokenized transactional overlay contextually tied to the third-party host environment.

**10.** The method of claim 1, further comprising establishing a deferred or server-side automated fee-splitting mechanism managed by the deterministic routing module, operating alongside the single atomic operation, wherein a protocol fee is decoupled from a primary non-custodial transfer and routed asynchronously to a designated treasury address.

**11.** A system for executing interactive transactions across agnostic settlement rails, comprising:
a) a processor;
b) a memory coupled to the processor, storing instructions that, when executed by the processor, cause the system to:
   i. deploy a universal transaction frame to a client device operating within a third-party application;
   ii. maintain a dual-rail routing registry configured to interface with both distributed ledger networks and traditional centralized fiat gateways;
   iii. receive an intent-to-purchase signal from the universal transaction frame;
   iv. encode a deterministic execution payload corresponding to the intent-to-purchase signal and a determined target settlement rail; and
   v. facilitate the direct transmission of the encoded deterministic execution payload from the client device to the determined target settlement rail, returning a cryptographic proof-of-validity to the remote server upon successful settlement.

**12.** The system of claim 11, wherein the universal transaction frame is structurally resilient against settlement network deprecation, whereby the removal, failure, or absence of the traditional centralized fiat gateway does not impede the system's ability to construct and route payloads to the distributed ledger networks, and conversely, the absence of the distributed ledger networks does not impede routing to the traditional centralized fiat gateway.

**13.** The system of claim 11, further comprising a trust verification registry, wherein prior to executing the transaction payload, the interactive transaction frame queries the trust verification registry to append a verified cryptographic badge to the universal transaction frame, mathematically proving a destination address is bound to a verified identity.

**14.** The system of claim 11, wherein the universal transaction frame is configured to dynamically alter its client-side code structure, metadata identifiers, or deployment scripts to bypass automated structural filters or blocking mechanisms implemented by the third-party host environment.

---

## ABSTRACT OF THE DISCLOSURE
A system and method for deploying interactive, executable transaction frames injected directly into third-party host environments such as social media feeds and messaging platforms. The system intercepts client-side user interactions and dynamically routes transaction execution payloads via an agnostic deterministic routing module. This enables seamless, non-custodial value transfer irrespective of the underlying settlement rail, natively supporting both decentralized cryptographic blockchain networks and traditional centralized fiat payment gateways. By decoupling the interface injection layer from the execution rails, the architecture executes atomic, fee-splitting transactions without redirecting the user and prevents circumvention by competitors utilizing single-rail architectures.
