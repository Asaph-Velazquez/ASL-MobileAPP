export const TERMS_AND_CONDITIONS = `**TERMS, CONDITIONS AND PRIVACY POLICY (ACADEMIC PROPOSAL)**

**Last updated:** April 29, 2026

**Establishment (Case Study):** Canada Central Hotel

**Developers:** Terminal Project Team No. 2026-B195 / Escuela Superior de Cómputo (ESCOM) - IPN

**Clarification Regarding the Nature of the Project** Canada Central Hotel is used exclusively as a case study to analyze accessibility needs and define the system's functional requirements. ASL Mobile App is not currently intended to provide services to actual guests. Therefore, this document constitutes a proposal for a possible future implementation and does not represent a notice issued by Canada Central Hotel, nor does it establish that the hotel currently processes personal data through ASL Mobile App. This document serves only as an illustrative basis for a possible future implementation.

**I. TERMS AND CONDITIONS OF USE**

**1. Nature and Purpose of the Service** ASL Mobile App is an artificial intelligence-based technological tool designed to improve communication between guests with hearing disabilities, whether prelingual or postlingual, and hotel staff. The system allows users to submit service requests through Text Mode and ASL Mode (American Sign Language recognition). Users may also request a video call with an interpreter when the other modes do not adequately communicate the guest's needs.

**2. Technical Requirements and Permissions** For the simulated platform to function correctly, the user expressly consents to the following:

- **Camera Access:** Capturing hand movements (extracting _landmarks_) for sign translation and for video call assistance with an interpreter.
- **Microphone Access:** Only when the guest chooses to start a video call with an interpreter, for audio transmission.
- **Connectivity:** Maintaining a stable internet connection for data exchange through WebSockets. During video calls with an interpreter, audio and video are transmitted through WebRTC.
- **Environmental Conditions:** Acknowledging that recognition accuracy depends on adequate lighting (at least 500 lux) and device stability.

**3. Limitation of Liability and AI Guarantees**

- **Probabilistic Model:** Due to the statistical nature of machine learning models, ASL Mobile App does not guarantee 100% accuracy in its interpretations.
- **Exclusion of Critical Uses:** ASL Mobile App MUST NOT be used for medical emergencies, civil protection protocols or life-threatening situations.
- **Scope of Video Calls:** Video calls with an interpreter provide support for clarifying hotel service requests when neither of the other two methods has been satisfactory; they do not replace emergency care or assistance from qualified personnel in critical situations.

**4. Intellectual Property and Copyright**

- **Software Ownership:** Under the Mexican Federal Copyright Law, the source code, graphical interfaces and ASL translation algorithms are the exclusive property of the Developers and the Instituto Politécnico Nacional (IPN).
- **Third-Party Libraries:** The system integrates open-source tools under permissive licenses (React Native, Expo, MediaPipe, OpenCV, Node.js and MongoDB), whose rights belong to their respective authors.

**5. Changes to the Terms**

These terms may be amended to accommodate new regulations or changes in the operation of ASL Mobile App. Changes will be communicated through the application before they take effect.

**II. PRIVACY POLICY AND PERSONAL DATA PROCESSING**

In strict compliance with the provisions of the Mexican Federal Law on the Protection of Personal Data Held by Private Parties (LFPDPPP) for this case study, the following is established:

**1. Personal Data Collected**

- **Identification and Registration Data:** Full name and room number.
- **Technical Image Data (Non-Biometric):** Temporary video capture. The system excludes facial recognition and the extraction of biometric identity features; it only processes mathematical joint coordinates (_landmarks_).
- **Communication and Request Data:** Text generated from sign interpretation or entered directly by the guest, along with each request's category and status, as needed for follow-up by authorized hotel staff.
- **Video Call Data:** Images and audio of the guest and interpreter, transmitted only when the guest requests assistance from a human interpreter. The session is not recorded. At the end, the interpreter prepares a written report describing the guest's request or need, which may contain personal data only when necessary to handle the request.

**2. Purposes of Processing**

- **Digital Accessibility:** Facilitating communication between guests and hotel staff by interpreting requests expressed in ASL into text.
- **Text Mode:** Allowing guests to communicate their needs in writing.
- **Service Management and Follow-Up:** Recording requests in the administration dashboard so authorized staff can review them and check their status (pending, in progress or completed).
- **Interpreter Assistance:** Facilitating communication when ASL and Text modes do not adequately convey a request, and allowing the interpreter to document the request in a written report for the hotel.
- **Excluded Purposes:** Data will not be used to identify guests through facial recognition, record video calls, create advertising profiles or train artificial intelligence models using the sessions. Any additional purpose must be disclosed in advance.

**3. Ephemeral Processing and Data Transfer**

- **Recognition Data Flow:** Camera images are processed on the device to extract hand joint coordinates (_landmarks_). Only these coordinates are sent to the inference server; no images or video are sent for sign recognition.
- **No External Storage:** Video is not stored. Once the request text has been generated, technical data is permanently and irreversibly removed from volatile memory.
- **Identity Isolation:** Identification data remains isolated within the simulated local infrastructure and is not linked to the AI inference engine.
- **Video Calls Without Recording:** Images and audio are transmitted through WebRTC and are neither recorded nor stored as audiovisual files. Signaling is managed through WebSockets and network address discovery through STUN; therefore, only technical connection metadata, such as IP addresses, may be processed. Hotel staff do not have access to the video call proceedings.
- **Report Retention:** Interpreter reports and request records are retained in the management system for as long as necessary to handle them; the ultimate data controller must define retention periods and the procedure for deleting them.

**4. Consent to Video Calls**

By accepting this policy, the guest agrees to the possibility of using video calls with an interpreter; however, a call may only be initiated by the guest when needed, and the guest may decline it at any time and continue using ASL Mode or Text Mode. Consent to a video call does not authorize its recording, retention as an audiovisual file or use of its content to train artificial intelligence models.

**5. Changes to the Privacy Policy**

Any material change to this policy will be communicated through ASL Mobile App, and the current version will be available before data is processed under conditions different from those previously disclosed.

**III. EXERCISE OF ARCO RIGHTS**

Under Mexican law, users of this proposal theoretically have the rights of Access, Rectification, Cancellation and Opposition (ARCO) concerning their personal data. Within the ASL Mobile App environment, these rights are simulated through:

- **Access and Rectification:** An in-person request at the hotel reception desk, including the deletion of identification data, requests and video call reports associated with the guest's stay. Uninstalling the application does not, by itself, delete information already recorded in the management system.
- **Digital Cancellation/Opposition:** Deleting cache and temporary data through the operating system settings or by uninstalling ASL Mobile App.
- **Withdrawal of Consent:** The guest may withdraw consent without retroactive effect, which may limit some application features. In particular, the guest may choose not to use video calls and communicate through ASL Mode or Text Mode; this refusal does not constitute a waiver of the guest's rights, but it does restrict the use of ASL Mobile App.

**IV. JURISDICTION AND APPLICABLE LAW**

For all matters concerning the interpretation and fulfillment of this test document, the parties submit to the jurisdiction of the federal laws of the United Mexican States and to the competent courts in Mexico City.`;
