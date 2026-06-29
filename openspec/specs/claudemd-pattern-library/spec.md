# claudemd-pattern-library Specification

## Purpose

Canonical section checklist and rubric for the ts-project-init-advisor pattern library (`claudemd-patterns.md`), specifying which sections are required, which are optional, and the 12-point scoring scale. This spec ensures the pattern library teaches advisors to produce project CLAUDE.md files that match the canonical template in `src/project_root_structure/CLAUDE.md`.

## Requirements

### Requirement: Required section checklist matches canonical template

The pattern library SHALL define the following sections as required in every project CLAUDE.md:
- Project
- Stack
- Commands
- Specs
- Architecture Map
- Project File Structure
- Hard Rules (≤15, project-scoped)
- Workflow (single pointer line to goverance_CLAUDE.md)
- Out of Scope
- Maintenance Checklist

The section "Behavior Rules" SHALL NOT appear as a required section name in the pattern library; "Hard Rules" is the canonical name.

The section "Tool Permissions" SHALL NOT appear as a required section; tool permissions belong in `.claude/settings.json`.

#### Scenario: Commands section is listed as required

- **WHEN** an advisor reads the Required Sections table in claudemd-patterns.md
- **THEN** "Commands" appears as a row with purpose "Dev/build/test/lint commands" and failure mode "Agent uses wrong commands"

#### Scenario: Hard Rules appears instead of Behavior Rules

- **WHEN** an advisor reads the Required Sections table
- **THEN** the row is named "Hard Rules" with purpose "Project-specific prohibitions and conventions (≤15 rules)"
- **THEN** no row named "Behavior Rules" exists in the table

#### Scenario: Tool Permissions is not a required section

- **WHEN** an advisor reads the Required Sections table
- **THEN** no row named "Tool Permissions" exists

<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
-->


<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - graphify-out/cache/semantic/c4cef9b68f5d53ba3b0268a466f90deabffe74154321145184b3b2c92e746c47.json
  - graphify-out/cache/semantic/15c28e7fc33562bf54735dc883e1b5556988ee081fbd3fad807dcd31c0751ec1.json
  - graphify-out/cache/semantic/78518ab7963f8511fc607597b22dae8ebb564602434ca1fc7ffd78ee0fe3a01d.json
  - graphify-out/cache/semantic/2fa27eda4acec43176597698e8553329e00337605047a0d65c1dc5157eea1528.json
  - graphify-out/cache/semantic/7df3d22a3e9933b090589d51ffd2dcdac7442cab01624370288c9ae1148484df.json
  - graphify-out/cache/semantic/c63a18be7c1092b5324a482f233dd8dc17de7af28cab99175d16a92dc6af697b.json
  - graphify-out/cache/semantic/c7c895c90d89e9cd9b4e3950590a81c04e83b4d1fff8e0b4985435060d8e2eb9.json
  - graphify-out/cache/semantic/d6d037cc5fbc7f991cb8b3f41afd2685e8d32201496ee70b13055178e770a907.json
  - graphify-out/cost.json
  - graphify-out/cache/semantic/52de177e49e90a8849d74fcb83feafbe2e4ec428844bfa6bc4227fde909b9042.json
  - graphify-out/cache/semantic/e055b4f794da960d908bea90943d253190690f94af54e90a3eb6a029e5aea58e.json
  - graphify-out/cache/semantic/7c3f4d5c900b4f4774dac25cab0e2193d78a9d8f992d110196364b40457397cf.json
  - graphify-out/cache/semantic/48cbc27761ac6c919aeffa938d8e1129f86a04c26a53a954378922df698a63ce.json
  - .spectra/changes/align-claudemd-patterns-with-canonical-template.started
  - graphify-out/cache/semantic/daa73c5435f7b5ad6f4a04c8cfbc3da2d6a2ce62eb3ff576aff66335c99a7457.json
  - graphify-out/cache/semantic/e4f4acbb4beeddb600a3af72243316e83b9cf9dfd1be35af32e8ec3dfc13bcc6.json
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
  - graphify-out/cache/semantic/9e7decb73db7ffe161d67b92498a21e9a394034ddf08c19755b7d05ec7731735.json
  - graphify-out/cache/semantic/4024cd44fe7eb512c253fc8c63e96a4c8347e1757f72221d9c6ba6ee0c114bfa.json
  - graphify-out/cache/semantic/1f81019a83c967ad2bff838f8db3a62e608bf48a1f0debe5620bd6affe1676fc.json
  - graphify-out/cache/semantic/dc4407acf80a2367a6be36386c0a9adf2747203d1ea70b44f00e365fb3580161.json
  - graphify-out/cache/semantic/82adcadd1a8760e736381f7a49c9f0388698463e0247a704b3255e298da07212.json
  - graphify-out/cache/semantic/2e4339fde919b35034bfbdc20fb389ab84c2dafb0903e02d667cca34cf3c897e.json
  - graphify-out/cache/semantic/dd0ec26f34c083ae04cfb9ad4a2adfa0211411e59561f734f6d4bfb27bb3ffcb.json
  - graphify-out/cache/semantic/e3fc9770dd41d6f2644a6639301106aa884224d2a6b229592d6368e30d0e6d98.json
  - graphify-out/cache/semantic/c11e49d44a30451e73022776ec8bf6611ce281ee1558dca047bfcf3711c179c3.json
  - graphify-out/cache/semantic/13ac9d0b782317033702a3f801ca5451018892a6a8699788b604b9777b447291.json
  - graphify-out/cache/semantic/bb57a7f92284356a308ce79bfb412ceaa58c07712d6902d4f672efe5d614fa2b.json
  - graphify-out/cache/semantic/35e96865a88747101f22c03654755f935a1d83a69cc0b44c8d50b03e7d9e9086.json
  - graphify-out/.graphify_labels.json
  - graphify-out/cache/semantic/7f1b10bc66d9b86304c6a7759eab4e5296fb495fdf7fd1710cee02705f6d48da.json
  - graphify-out/cache/semantic/bd8628dac7e60e3f2349146f4c1afc12cb217fbb20cc93aa4bb946cb66cdb833.json
  - graphify-out/cache/semantic/485812515c1974342c86c214b769195c6be6a2ca4250f3ccbec8cb4ce8d91007.json
  - graphify-out/cache/semantic/be8a5fb5fa02ce9d4a7179cafb3aee29f7249c0e438b362ccae8110d3a3b9272.json
  - graphify-out/cache/semantic/e18a9fc4cf081e1d4a10f5a82f97a1121819c544ce0e4129347b3e03a5172005.json
  - graphify-out/cache/semantic/286ef28cf6d6f2f33e272b4fe0fba67e71f1d7717093eab6e27588c3d3f5a4ff.json
  - graphify-out/cache/semantic/13b6b88f2a7837fab8e96a50cbb227977056f928248f73f3226ae1d8477eb659.json
  - graphify-out/graph.json
  - graphify-out/cache/semantic/3215f3dc0a999839c33faf1083b8a42be23ffca4922077749ae511cd60ed4dac.json
  - graphify-out/cache/semantic/404e3194ef9150686ce079cc651fc37fe4fc76ad7c450ba3d0c3c3041e2714f4.json
  - graphify-out/cache/semantic/bf9dffdaf41d9f55c80a5fbbc8ecf36afb4e0662f13e71d204d471404f46e64c.json
  - graphify-out/cache/semantic/9d3548f299f2196d47bae975d57ffb5ab44924a1c848f32f479be269b7661d4c.json
  - graphify-out/cache/semantic/8499901ca09af81499ec7a32b524ef190776b34b11cd4d0596960e025f12657f.json
  - graphify-out/cache/semantic/f7f3020cb12a9191ae6f1b5c2f9d6b3a0487c82a4395d97696470514e1a4c06b.json
  - graphify-out/cache/semantic/3255d8ab6709240ca1afb52b90a2fe6c7f167ca095b21f3178b742835cbd43d2.json
  - graphify-out/cache/semantic/b78cd456c3da6afeda800a2b76a55fc339266beb28f04e9d4fc796879cc4788b.json
  - graphify-out/cache/semantic/241717c78c067f69d5acc2a7de091374647ac49336ac243f68225b911dfdb8e4.json
  - graphify-out/cache/semantic/d8be7b99474994cd01a3b7b596c2626592bfc8d42c883ce6d482e21b8ac1611a.json
  - graphify-out/cache/semantic/a65abc71a5912237bd19f84197c462293b1d92a6024db89fab88bb8805d321f0.json
  - graphify-out/cache/semantic/c42fd4d8c851e352ed8de27ccdc82d050b437c7b1c31703235c84d971a6ca5a8.json
  - graphify-out/cache/semantic/b450a2671cd153f5f2d00793595fa0c1461792d63c5d5afd51da7c92659f2509.json
  - graphify-out/cache/semantic/ca72404d5d8b8c1a042dbfa4fb6eefedb7a10b8e0a86d60429dd975fa244ee98.json
  - graphify-out/cache/ast/v0.8.44/e011bb38d69ce6ca916bef32ca23a596e111394a4a69d0bac01f6d4422e692e1.json
  - graphify-out/cache/semantic/1564278f786f145208f4418becb5e087e9c305f6925bee8db1e556b78f4258d0.json
  - graphify-out/cache/semantic/d66cc6e97d687710eeaa911c471df04f217036251d48120dbd18961e72bf7121.json
  - graphify-out/cache/semantic/4fc46ba057e42a58981e3b5845c2d8974228c4ae2736e4b2273b943337e46c92.json
  - graphify-out/cache/semantic/df15782a31b1a17a4ec6de7d1336652c180835fab3f5904ae60bdb1a5698dd7a.json
  - graphify-out/cache/semantic/ec69655b3b3b01c696ea4696bbfd9d4455410a5e8e60217552a1039609ea6c3c.json
  - tasks/borisChernyClaudeMd.md
  - graphify-out/cache/semantic/04711698dd67d226450aff32ebbcb0d03280f19df052922e269f5bd6558f745a.json
  - graphify-out/cache/semantic/c818f33f9faa844e783d03754b9220ca81330a51e7cff8a3d4750eef9960af37.json
  - graphify-out/cache/semantic/c19b330cf7eda3314f82d2e3995955a9f97661895cff654c343cb02d4eff8294.json
  - graphify-out/cache/semantic/53f5c9056957bfdfc52b7d5187cc54af36864996abe4d38b2a70f53995c4ab90.json
  - graphify-out/cache/semantic/31681bb6a086dc2cb06da8c2e69c6d452499902a73073df8dd4d978975d4faa2.json
  - graphify-out/cache/semantic/eb5298226491b7442598f9532f7e9f8d95a3e6ffa1444e6db4fca41bc697d806.json
  - graphify-out/cache/semantic/ac382c6bd763edf573332f6b3aec6aaf9e01f35968babe9069414adebc1c7a13.json
  - graphify-out/cache/semantic/69d13ca8396d00817412c2c7e6711bf820df603c09ee2678464796c4e5fd6515.json
  - graphify-out/cache/semantic/fca81a20b67bc38d9cb8e07ced890d85d4e24c885e26fe561e779d14233d82dc.json
  - graphify-out/cache/semantic/5176ad8f26bf991a7c0e10f56b20305115ecf74fb1520b25a4232d5838d6f2d2.json
  - graphify-out/GRAPH_REPORT.md
  - graphify-out/cache/semantic/1f458a9dac9a1bacbfa28306be5ba67e8a42f3edd48f4d609ad11ce5f3fe9847.json
  - graphify-out/cache/semantic/de4e06f586c9cf9b2b3cd358c26b7bebdb9454198fd28e3b95873969427a50e5.json
  - graphify-out/cache/semantic/75502fb7cc6f0cb7677ad72e6adffa007d7520d315fc2576e88c5ae741d03d41.json
  - graphify-out/cache/semantic/ea8ee411b24a1286d1ad1b24a8948c695952668ad602bfe7378946a724a75f8c.json
  - graphify-out/cache/ast/v0.8.44/b604d3648f723b98f741bf48633af4bc73344e137fd8f08a75f0cd81f49e58fa.json
  - graphify-out/cache/ast/v0.8.44/f48dbf5cad37229732280de2fda8eae627b2aa5efcb41f24986c323a3c5f9365.json
  - graphify-out/cache/semantic/3930ce8cdef5dbbf2a09d93923542a9911b9cc31aa80defa00393a634d265d08.json
  - graphify-out/cache/semantic/55a2d2362807d714499f4a2731e47a668fe5d867b8074af3a56ada31b5677943.json
  - graphify-out/cache/semantic/5b7b5a7fed6b6830355510472a9d03b7e549a1ffa65ec815905fee3d2baf2a3b.json
  - graphify-out/cache/ast/v0.8.44/4c09477cadc21a4125c7c57a2434a8696b1fee71f23dd172ecd7ea200955dd99.json
  - graphify-out/cache/semantic/60e15b393d612db5336a22d4e6adbb3c6c51fa07dbf16cc01a794bc436a62861.json
  - graphify-out/cache/ast/v0.8.44/386401368c66971a3f07a3f56ce8ab9e9153901112b190a4fcf2051c46bdc075.json
  - graphify-out/cache/semantic/7a25d0e1e941fd88d83e5880cd325a48a732ca2640952633f93bc344a0828999.json
  - graphify-out/cache/semantic/83afb8f39e9f95c5645049720d7b497b21920a23ac1ab11512676952326f5299.json
  - graphify-out/cache/semantic/a0ebeb44f7244d90ac5d612fd8e12a240d649ef3c382dbed0fb025b237089985.json
  - graphify-out/graph.html
  - graphify-out/cache/semantic/ed70251e58da3816c8644df29b2b5211e6d74ce7dd816a8654061746ede7e088.json
  - graphify-out/cache/semantic/af0dd5d8d360c157a22c28e89f7697ec95ac0fe4d490e56d1494a904175328e1.json
  - graphify-out/cache/stat-index.json
  - graphify-out/cache/semantic/418ba54c8dcecb21bb27ae58b81e1ab8c98cf655be66267abe1a777858852cf2.json
  - graphify-out/cache/ast/v0.8.44/4ddf5e9458a8a22b201cb0a90a5770643b7d39577622a5b279934c859ce3aef2.json
  - graphify-out/cache/semantic/764b7b7b7656f817e99db4289295b968b5e4a0aa0ba032eaddc6876c21e84634.json
  - graphify-out/cache/semantic/f8e1222dff223e7119d52904f365a2458761491296730d73111d756418063a03.json
  - graphify-out/cache/semantic/e8f9cad313f2fb81dc8f5c5a42955feb9069c4486403d3b8fc01a1b44f02c407.json
  - graphify-out/cache/semantic/46f2b5ebd08d708504f4259f39868ddfdf15109366acaa4069b47f5fa3d01acc.json
  - graphify-out/cache/semantic/03eaf00cbe965e62ceffcc98127b2c4075b9e6c737ed54e1eea3ea6bd8caaefc.json
  - graphify-out/cache/semantic/d549692471c10078e73a087548268c9298907c60873fe991c04136fba1624c7b.json
  - graphify-out/.graphify_python
  - graphify-out/cache/semantic/1d06a280f0b5d6431aad69f6d259cd93941119675d2fde409f12e45afd0e634b.json
  - graphify-out/cache/semantic/37eb647b8cef4372462e4faf10b53e055f762b754de2a289b2b06f1275f08873.json
  - graphify-out/cache/ast/v0.8.44/42cf34065153763fb0663ed89879c6e50fcdb7753b6397b6a33d38518c3aea3c.json
  - graphify-out/cache/semantic/8515b018028115764b5136669a62294b4b3c33e5f9357488f180d4fb5c6e5e10.json
  - graphify-out/cache/semantic/54ab38ac49296b3d3db44b9c9155a66ad0a7618961ff3e177fb4f559afa4ffe1.json
  - graphify-out/cache/semantic/a2b958060ec2d3b4508d31d6971d50d0e6a64844c1e7c0c01b083d33489d3c0d.json
  - graphify-out/cache/semantic/f9ff791c6c95d9dace67f1dd389321f368be5e4f837d02d9b75cda2c9be5dd94.json
  - graphify-out/cache/semantic/3025b0a360bd70abc9dff168bf1d371298a81728f306e0e32e87c1c700b7efb4.json
  - graphify-out/cache/semantic/a6374249375dd8a9efff3bd1f6a04d4ca0eb9a70299b6606577ef6065af1f084.json
  - graphify-out/cache/semantic/6fb4fba0c01239bb87d523d630b860ba4f4bfe6582b17d584cc4399ae063b101.json
  - graphify-out/cache/semantic/a4465690110f5ae8122d600b92075817e1440fcf046d2c5e6b8d296ca847b67b.json
  - graphify-out/cache/semantic/daf278620d4dce79dde6a74e52afdbe79337e5a39a52b471466b465e31577c09.json
  - graphify-out/cache/semantic/81f4c75b353262641a5e34172c5958cebdd59e607b813c9fb4bd76ae84b9b7ea.json
  - graphify-out/cache/ast/v0.8.44/d6df45b4de58cef579af121ff7f7566b0ba52fd06a19a5cb430d5cbae3ce4d6f.json
  - graphify-out/cache/semantic/d91c8c175fca7bd335cb800646b1a492e4a662f79390efc2a33bef2cc9e19e1d.json
  - graphify-out/cache/semantic/26ce1273ad133a0943228a5f07176c95ed385bb450fdcf635c9629eb11621a84.json
  - graphify-out/cache/semantic/2a8876b5505120f3fe877e9533e2214b87c3433eb97e9f0388b8fb5cc8f32866.json
  - graphify-out/cache/semantic/5ee64324ff95f7839fb497b56695cf288bea332857b56986fe405268b6803d66.json
  - graphify-out/cache/semantic/d120bbd6b8d2ee7db78c923dd58afaff727f0262ca47e6660adde5037d2f61c4.json
  - graphify-out/cache/semantic/5756b578c1afc6e11f3fde8c1ed6d68c8c903b5508dc9500c5e1f5135a9a0a0b.json
  - graphify-out/cache/semantic/b66d270a3455b7bc99742d45ff12c848546009e7fbb74e6a8de39b732501ee96.json
  - graphify-out/cache/semantic/6925e2c9eb7efa0e29184bc0d02eaaa250dfc98fccf8d8cd4cf68ca21fbcd5d5.json
  - graphify-out/cache/semantic/be648dbaee8066094a541dacb6060328b8a395264776b75545240716c70c2c54.json
  - graphify-out/cache/semantic/61460724ea9d23dc20c656a37426157b0e519f47dd45e82d254d1113912fb117.json
  - graphify-out/cache/semantic/5d6b8379ba1c8eb39bc57ea5450eb2162bb7e3806798c49b6ba58b28235b744d.json
  - graphify-out/cache/semantic/9c63cd450cdf464ef8e8fd3002d62dda77d8d0950fbcbca13a53fa3735670d98.json
  - graphify-out/cache/semantic/1702c55b9f7996536329d87c20db315b2aa0537fd4bcdb916fd329cf221f152c.json
  - graphify-out/cache/semantic/c0558d27b20437347205804cb156633e5e4318491bbbed2184098d8bd82cf857.json
  - graphify-out/cache/semantic/c3a4b0bb1b96432b0d26e46a5200399619a1f0af8ab7e2fc973c25811223beb8.json
  - graphify-out/cache/semantic/d1f2194401dbb84e56c98a0d166ee228a61e1175ac3d0b8b513f4cf7399a9ea4.json
  - graphify-out/cache/semantic/f4a12812264edfe4063c229a68b86f446f154f6f29439337006c756f9dc82e09.json
  - graphify-out/cache/semantic/dd2711dd2c80914697cdee0a471a409e096e25ebf9e298d7884ffdedc51c4c60.json
  - graphify-out/cache/ast/v0.8.44/574a84a9392c4f7ba5faf7475dd2c1d7b47c5476408d1bce4faba800bc0a9a4a.json
  - graphify-out/cache/semantic/75e5a0f05909f655e6a1f7927048d5903731c8755a6ac6896088eee442e6042e.json
  - graphify-out/cache/semantic/0f14e768c70859ccdc771b8faa81a78f97d20ef64f028b072a6bcd6b62ea13d4.json
  - graphify-out/cache/semantic/be8ae53a6205061665afe5fef67c7b9f64241ef737c45035709b2bc912c0df69.json
  - graphify-out/cache/semantic/4789a8b4cf6e254a9bcc95b905f26917ea83cca88926cc6bde195071a6a99a63.json
  - graphify-out/cache/semantic/474baa2bcd237c68c96539c6f68e8b7a461198d9560632c9fce4c1c39819c926.json
  - graphify-out/cache/semantic/c989cd2911893853a4941e7d5eb1ca7a33ca87f50ef0432adcb463b7395b399f.json
  - graphify-out/cache/semantic/4a50fd8270b73057457032bc7ffb79fbbce30e0f36b96c1ee7f133dc816e81a7.json
  - graphify-out/cache/semantic/541e16aa32fc813d570f5b7f8be9a7970424c341c08ac414d96dc53421c69116.json
  - graphify-out/cache/semantic/3b233a6754cae6a7ec00c998eb21db4e5869c5ec5875f891ce89a03cec9cf58f.json
  - graphify-out/cache/semantic/02bfe00789d054a7c76f739fc6c398adedb8e1dbbf9722b281f6d92bf83a0271.json
  - graphify-out/cache/semantic/ae698ef095bfc85aafac8e304f12e477c267a32199fd6cd7a102fcd5113c9e2b.json
  - graphify-out/cache/semantic/9f10a77fb1d452119cee51a37c77e354e394ce2fbbde2af3dde534f019c0e339.json
  - graphify-out/cache/semantic/9a6a4c4b2ba07576235e946bb844fa5b06717fa6381da99e8fcef09959133ed7.json
  - graphify-out/cache/ast/v0.8.44/4c0d430e23e0a32d12234431b56a6b60af0ea7c7fb0f22ed31ed98b32453f006.json
  - graphify-out/cache/semantic/f5ca7834d7834443da40eb6aef590d58330024f930811f7a25300d004318a045.json
  - graphify-out/.graphify_root
  - graphify-out/cache/semantic/00840100e466a34f28d4590d8b5599e58ecb9abee7391661aeb1ef8d3395f971.json
  - graphify-out/cache/semantic/7589e46f60fc63aba488bb0cfc79a4141081c542ee24b779fb3aea03be915672.json
  - graphify-out/cache/semantic/9fc88904143587a712371d495e0baa42f5b1198b9d0203e7e70200cca5068520.json
  - graphify-out/cache/semantic/bc3763d64d10d52cfa9494181eaa5c0f3c83677582c34ab403fb0d0a03b0b3e8.json
  - graphify-out/cache/semantic/b49db37e0cfbd723612f081dc5c08247c8b0f09c8b3c9b54ed329b9936947549.json
  - graphify-out/cache/semantic/82d5f0c6ae9106955bb06e634959b449b88ef946632cd422fca2b774d162a0ab.json
  - graphify-out/cache/semantic/c8095da5318802edff81d93935072ba324aee73b6a95ecddc0875a6504058560.json
  - graphify-out/cache/semantic/dbbe74f34f30470277fbe432f4b3e751f22f4760c3db01619adbad3f9043ba76.json
  - graphify-out/cache/ast/v0.8.44/d8003394aa45c3820bd613b17355e0e97b5267f821949a3bce464129cfa19158.json
  - graphify-out/cache/semantic/c7847137a048d9bdc3be7a2454190d30a1ce34963b27703ebfe3db2aef6436ee.json
  - graphify-out/cache/semantic/ab003bd3904987bac1962a597b922b0d3ac10e05823a6e285f0e65c15ac5f308.json
  - graphify-out/cache/semantic/d5c563bd888151e85553cb3f1153d6a8b62de905674e3a831169488d76172cea.json
  - graphify-out/cache/ast/v0.8.44/ff7bb897cccbbf5a2d4fcac2c213a9438078ac2df0fb3069a1f15fa88912ca47.json
  - graphify-out/cache/semantic/87ce33d2f7eff5da8b80b13d868bc00a1a5acbb776d5a8fee607abec9ab2e574.json
  - graphify-out/cache/semantic/f7dd8aa42cca86a382392629232ffbfa27ceae5ac4c42de704fbbf88b70de328.json
  - graphify-out/cache/ast/v0.8.44/40ee6cb0a8e93cbd0e7c5bd318e52dd3612b55b848b72b8b8d72c2dac71f3372.json
  - graphify-out/cache/semantic/c3414687ca9085d30bc796743322363bb5513370abd08625f910a9639cd8cbf6.json
  - graphify-out/cache/semantic/aed2536aa56856ebcb5610c6c364cac37543bcab09234ad89716e7a1f62cef46.json
  - graphify-out/cache/semantic/247820da0d7d6fd13800421af373a0051f1b521ec1a9fe8335aeb30a4a8e1c28.json
  - graphify-out/cache/ast/v0.8.44/4cbcd914a9bb5d5b6be63fcba8aa1457ebf94009d55941c038bc072de375cb28.json
  - graphify-out/cache/ast/v0.8.44/1a786b9bb2244dd4f1b26e79bb246848b38636d8fd314425571555f4cda91a87.json
  - graphify-out/cache/semantic/4f24acc4f4d5af198fc81a0dbc4733eec52544c405014dd46d2e0f5c9d4c3d35.json
  - graphify-out/cache/semantic/540e1759cf0c1e149d246eba0ad69767f686b31103fe1835682fc0de4bb2e566.json
  - graphify-out/cache/semantic/955780e0901822aec0e4050ebf07de2591dc412e4ab002882599f0a5200243b4.json
  - graphify-out/cache/semantic/f05794463e030a9105ec4c529341bccdca5ca2f1abe61576822dd572d9659370.json
  - graphify-out/manifest.json
  - graphify-out/cache/semantic/3f720e7a0c4ce9caabcf02bfabd5914f765f216e40473d539ed43c42039c9aed.json
  - graphify-out/cache/semantic/2dc3d5c57a5d1b9b7824ea72fea16a68cbbd28b228f9c27bccbf620cf66e2167.json
  - graphify-out/cache/semantic/fd9c53ae1e751e2ae2260fa07ee2be45e6cbf9237cf2f3b6b3dcededc102f315.json
  - graphify-out/cache/semantic/b7f587b2470ba2c4bcde54aa271fef31b971c9f38ffe042653e0a012298e90b5.json
  - graphify-out/cache/semantic/fd59ec92a6cccb9090d6b1e1f31d724cc3dc7324d1af5a83a36fe9303a2fd813.json
  - graphify-out/cache/semantic/62553e59426aedfa0e45bfd9efd1a08a6864607d01d6d414646ca26bfc26004d.json
  - graphify-out/cache/semantic/fed7ca43d67afc83f5c49765461f5028ab8ac6cf8d0f274497200be60a74a894.json
  - graphify-out/cache/semantic/167919c3766baabe568b03d75c9a9983154aeaa8513b9606fbbe035b8ecc5504.json
  - graphify-out/cache/semantic/953298b01ebb47f4f0ac33ec322570c8a1f0f71c54751d6e764cb3ee8fac5b82.json
  - graphify-out/cache/semantic/b33c9c10f2abdfd280a1286796f706ca01930aeb2cb3f1e34e6857b716f89c8c.json
  - graphify-out/cache/semantic/60447ca4eb9241f515f5567d5465d99f8abdf76ead0faf8a8ff83ff1a020d1d5.json
-->

---
### Requirement: Optional section list excludes golden-file content

The pattern library SHALL list the following as optional sections only:
- MCP / Tool References

The following items SHALL NOT appear as optional sections in the pattern library:
- Sub-agent Contracts (belongs in goverance_CLAUDE.md Agents Registry)
- Compaction Strategy (not in canonical template)
- Memory Anchors (not in canonical template)

#### Scenario: MCP references are optional not required

- **WHEN** an advisor reads the section classification
- **THEN** "MCP / Tool References" appears in the optional list, not the required list

#### Scenario: Sub-agent Contracts not in pattern library sections

- **WHEN** an advisor reads all section classifications (required + optional)
- **THEN** "Sub-agent Contracts" does not appear in either list

<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
-->


<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - graphify-out/cache/semantic/c4cef9b68f5d53ba3b0268a466f90deabffe74154321145184b3b2c92e746c47.json
  - graphify-out/cache/semantic/15c28e7fc33562bf54735dc883e1b5556988ee081fbd3fad807dcd31c0751ec1.json
  - graphify-out/cache/semantic/78518ab7963f8511fc607597b22dae8ebb564602434ca1fc7ffd78ee0fe3a01d.json
  - graphify-out/cache/semantic/2fa27eda4acec43176597698e8553329e00337605047a0d65c1dc5157eea1528.json
  - graphify-out/cache/semantic/7df3d22a3e9933b090589d51ffd2dcdac7442cab01624370288c9ae1148484df.json
  - graphify-out/cache/semantic/c63a18be7c1092b5324a482f233dd8dc17de7af28cab99175d16a92dc6af697b.json
  - graphify-out/cache/semantic/c7c895c90d89e9cd9b4e3950590a81c04e83b4d1fff8e0b4985435060d8e2eb9.json
  - graphify-out/cache/semantic/d6d037cc5fbc7f991cb8b3f41afd2685e8d32201496ee70b13055178e770a907.json
  - graphify-out/cost.json
  - graphify-out/cache/semantic/52de177e49e90a8849d74fcb83feafbe2e4ec428844bfa6bc4227fde909b9042.json
  - graphify-out/cache/semantic/e055b4f794da960d908bea90943d253190690f94af54e90a3eb6a029e5aea58e.json
  - graphify-out/cache/semantic/7c3f4d5c900b4f4774dac25cab0e2193d78a9d8f992d110196364b40457397cf.json
  - graphify-out/cache/semantic/48cbc27761ac6c919aeffa938d8e1129f86a04c26a53a954378922df698a63ce.json
  - .spectra/changes/align-claudemd-patterns-with-canonical-template.started
  - graphify-out/cache/semantic/daa73c5435f7b5ad6f4a04c8cfbc3da2d6a2ce62eb3ff576aff66335c99a7457.json
  - graphify-out/cache/semantic/e4f4acbb4beeddb600a3af72243316e83b9cf9dfd1be35af32e8ec3dfc13bcc6.json
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
  - graphify-out/cache/semantic/9e7decb73db7ffe161d67b92498a21e9a394034ddf08c19755b7d05ec7731735.json
  - graphify-out/cache/semantic/4024cd44fe7eb512c253fc8c63e96a4c8347e1757f72221d9c6ba6ee0c114bfa.json
  - graphify-out/cache/semantic/1f81019a83c967ad2bff838f8db3a62e608bf48a1f0debe5620bd6affe1676fc.json
  - graphify-out/cache/semantic/dc4407acf80a2367a6be36386c0a9adf2747203d1ea70b44f00e365fb3580161.json
  - graphify-out/cache/semantic/82adcadd1a8760e736381f7a49c9f0388698463e0247a704b3255e298da07212.json
  - graphify-out/cache/semantic/2e4339fde919b35034bfbdc20fb389ab84c2dafb0903e02d667cca34cf3c897e.json
  - graphify-out/cache/semantic/dd0ec26f34c083ae04cfb9ad4a2adfa0211411e59561f734f6d4bfb27bb3ffcb.json
  - graphify-out/cache/semantic/e3fc9770dd41d6f2644a6639301106aa884224d2a6b229592d6368e30d0e6d98.json
  - graphify-out/cache/semantic/c11e49d44a30451e73022776ec8bf6611ce281ee1558dca047bfcf3711c179c3.json
  - graphify-out/cache/semantic/13ac9d0b782317033702a3f801ca5451018892a6a8699788b604b9777b447291.json
  - graphify-out/cache/semantic/bb57a7f92284356a308ce79bfb412ceaa58c07712d6902d4f672efe5d614fa2b.json
  - graphify-out/cache/semantic/35e96865a88747101f22c03654755f935a1d83a69cc0b44c8d50b03e7d9e9086.json
  - graphify-out/.graphify_labels.json
  - graphify-out/cache/semantic/7f1b10bc66d9b86304c6a7759eab4e5296fb495fdf7fd1710cee02705f6d48da.json
  - graphify-out/cache/semantic/bd8628dac7e60e3f2349146f4c1afc12cb217fbb20cc93aa4bb946cb66cdb833.json
  - graphify-out/cache/semantic/485812515c1974342c86c214b769195c6be6a2ca4250f3ccbec8cb4ce8d91007.json
  - graphify-out/cache/semantic/be8a5fb5fa02ce9d4a7179cafb3aee29f7249c0e438b362ccae8110d3a3b9272.json
  - graphify-out/cache/semantic/e18a9fc4cf081e1d4a10f5a82f97a1121819c544ce0e4129347b3e03a5172005.json
  - graphify-out/cache/semantic/286ef28cf6d6f2f33e272b4fe0fba67e71f1d7717093eab6e27588c3d3f5a4ff.json
  - graphify-out/cache/semantic/13b6b88f2a7837fab8e96a50cbb227977056f928248f73f3226ae1d8477eb659.json
  - graphify-out/graph.json
  - graphify-out/cache/semantic/3215f3dc0a999839c33faf1083b8a42be23ffca4922077749ae511cd60ed4dac.json
  - graphify-out/cache/semantic/404e3194ef9150686ce079cc651fc37fe4fc76ad7c450ba3d0c3c3041e2714f4.json
  - graphify-out/cache/semantic/bf9dffdaf41d9f55c80a5fbbc8ecf36afb4e0662f13e71d204d471404f46e64c.json
  - graphify-out/cache/semantic/9d3548f299f2196d47bae975d57ffb5ab44924a1c848f32f479be269b7661d4c.json
  - graphify-out/cache/semantic/8499901ca09af81499ec7a32b524ef190776b34b11cd4d0596960e025f12657f.json
  - graphify-out/cache/semantic/f7f3020cb12a9191ae6f1b5c2f9d6b3a0487c82a4395d97696470514e1a4c06b.json
  - graphify-out/cache/semantic/3255d8ab6709240ca1afb52b90a2fe6c7f167ca095b21f3178b742835cbd43d2.json
  - graphify-out/cache/semantic/b78cd456c3da6afeda800a2b76a55fc339266beb28f04e9d4fc796879cc4788b.json
  - graphify-out/cache/semantic/241717c78c067f69d5acc2a7de091374647ac49336ac243f68225b911dfdb8e4.json
  - graphify-out/cache/semantic/d8be7b99474994cd01a3b7b596c2626592bfc8d42c883ce6d482e21b8ac1611a.json
  - graphify-out/cache/semantic/a65abc71a5912237bd19f84197c462293b1d92a6024db89fab88bb8805d321f0.json
  - graphify-out/cache/semantic/c42fd4d8c851e352ed8de27ccdc82d050b437c7b1c31703235c84d971a6ca5a8.json
  - graphify-out/cache/semantic/b450a2671cd153f5f2d00793595fa0c1461792d63c5d5afd51da7c92659f2509.json
  - graphify-out/cache/semantic/ca72404d5d8b8c1a042dbfa4fb6eefedb7a10b8e0a86d60429dd975fa244ee98.json
  - graphify-out/cache/ast/v0.8.44/e011bb38d69ce6ca916bef32ca23a596e111394a4a69d0bac01f6d4422e692e1.json
  - graphify-out/cache/semantic/1564278f786f145208f4418becb5e087e9c305f6925bee8db1e556b78f4258d0.json
  - graphify-out/cache/semantic/d66cc6e97d687710eeaa911c471df04f217036251d48120dbd18961e72bf7121.json
  - graphify-out/cache/semantic/4fc46ba057e42a58981e3b5845c2d8974228c4ae2736e4b2273b943337e46c92.json
  - graphify-out/cache/semantic/df15782a31b1a17a4ec6de7d1336652c180835fab3f5904ae60bdb1a5698dd7a.json
  - graphify-out/cache/semantic/ec69655b3b3b01c696ea4696bbfd9d4455410a5e8e60217552a1039609ea6c3c.json
  - tasks/borisChernyClaudeMd.md
  - graphify-out/cache/semantic/04711698dd67d226450aff32ebbcb0d03280f19df052922e269f5bd6558f745a.json
  - graphify-out/cache/semantic/c818f33f9faa844e783d03754b9220ca81330a51e7cff8a3d4750eef9960af37.json
  - graphify-out/cache/semantic/c19b330cf7eda3314f82d2e3995955a9f97661895cff654c343cb02d4eff8294.json
  - graphify-out/cache/semantic/53f5c9056957bfdfc52b7d5187cc54af36864996abe4d38b2a70f53995c4ab90.json
  - graphify-out/cache/semantic/31681bb6a086dc2cb06da8c2e69c6d452499902a73073df8dd4d978975d4faa2.json
  - graphify-out/cache/semantic/eb5298226491b7442598f9532f7e9f8d95a3e6ffa1444e6db4fca41bc697d806.json
  - graphify-out/cache/semantic/ac382c6bd763edf573332f6b3aec6aaf9e01f35968babe9069414adebc1c7a13.json
  - graphify-out/cache/semantic/69d13ca8396d00817412c2c7e6711bf820df603c09ee2678464796c4e5fd6515.json
  - graphify-out/cache/semantic/fca81a20b67bc38d9cb8e07ced890d85d4e24c885e26fe561e779d14233d82dc.json
  - graphify-out/cache/semantic/5176ad8f26bf991a7c0e10f56b20305115ecf74fb1520b25a4232d5838d6f2d2.json
  - graphify-out/GRAPH_REPORT.md
  - graphify-out/cache/semantic/1f458a9dac9a1bacbfa28306be5ba67e8a42f3edd48f4d609ad11ce5f3fe9847.json
  - graphify-out/cache/semantic/de4e06f586c9cf9b2b3cd358c26b7bebdb9454198fd28e3b95873969427a50e5.json
  - graphify-out/cache/semantic/75502fb7cc6f0cb7677ad72e6adffa007d7520d315fc2576e88c5ae741d03d41.json
  - graphify-out/cache/semantic/ea8ee411b24a1286d1ad1b24a8948c695952668ad602bfe7378946a724a75f8c.json
  - graphify-out/cache/ast/v0.8.44/b604d3648f723b98f741bf48633af4bc73344e137fd8f08a75f0cd81f49e58fa.json
  - graphify-out/cache/ast/v0.8.44/f48dbf5cad37229732280de2fda8eae627b2aa5efcb41f24986c323a3c5f9365.json
  - graphify-out/cache/semantic/3930ce8cdef5dbbf2a09d93923542a9911b9cc31aa80defa00393a634d265d08.json
  - graphify-out/cache/semantic/55a2d2362807d714499f4a2731e47a668fe5d867b8074af3a56ada31b5677943.json
  - graphify-out/cache/semantic/5b7b5a7fed6b6830355510472a9d03b7e549a1ffa65ec815905fee3d2baf2a3b.json
  - graphify-out/cache/ast/v0.8.44/4c09477cadc21a4125c7c57a2434a8696b1fee71f23dd172ecd7ea200955dd99.json
  - graphify-out/cache/semantic/60e15b393d612db5336a22d4e6adbb3c6c51fa07dbf16cc01a794bc436a62861.json
  - graphify-out/cache/ast/v0.8.44/386401368c66971a3f07a3f56ce8ab9e9153901112b190a4fcf2051c46bdc075.json
  - graphify-out/cache/semantic/7a25d0e1e941fd88d83e5880cd325a48a732ca2640952633f93bc344a0828999.json
  - graphify-out/cache/semantic/83afb8f39e9f95c5645049720d7b497b21920a23ac1ab11512676952326f5299.json
  - graphify-out/cache/semantic/a0ebeb44f7244d90ac5d612fd8e12a240d649ef3c382dbed0fb025b237089985.json
  - graphify-out/graph.html
  - graphify-out/cache/semantic/ed70251e58da3816c8644df29b2b5211e6d74ce7dd816a8654061746ede7e088.json
  - graphify-out/cache/semantic/af0dd5d8d360c157a22c28e89f7697ec95ac0fe4d490e56d1494a904175328e1.json
  - graphify-out/cache/stat-index.json
  - graphify-out/cache/semantic/418ba54c8dcecb21bb27ae58b81e1ab8c98cf655be66267abe1a777858852cf2.json
  - graphify-out/cache/ast/v0.8.44/4ddf5e9458a8a22b201cb0a90a5770643b7d39577622a5b279934c859ce3aef2.json
  - graphify-out/cache/semantic/764b7b7b7656f817e99db4289295b968b5e4a0aa0ba032eaddc6876c21e84634.json
  - graphify-out/cache/semantic/f8e1222dff223e7119d52904f365a2458761491296730d73111d756418063a03.json
  - graphify-out/cache/semantic/e8f9cad313f2fb81dc8f5c5a42955feb9069c4486403d3b8fc01a1b44f02c407.json
  - graphify-out/cache/semantic/46f2b5ebd08d708504f4259f39868ddfdf15109366acaa4069b47f5fa3d01acc.json
  - graphify-out/cache/semantic/03eaf00cbe965e62ceffcc98127b2c4075b9e6c737ed54e1eea3ea6bd8caaefc.json
  - graphify-out/cache/semantic/d549692471c10078e73a087548268c9298907c60873fe991c04136fba1624c7b.json
  - graphify-out/.graphify_python
  - graphify-out/cache/semantic/1d06a280f0b5d6431aad69f6d259cd93941119675d2fde409f12e45afd0e634b.json
  - graphify-out/cache/semantic/37eb647b8cef4372462e4faf10b53e055f762b754de2a289b2b06f1275f08873.json
  - graphify-out/cache/ast/v0.8.44/42cf34065153763fb0663ed89879c6e50fcdb7753b6397b6a33d38518c3aea3c.json
  - graphify-out/cache/semantic/8515b018028115764b5136669a62294b4b3c33e5f9357488f180d4fb5c6e5e10.json
  - graphify-out/cache/semantic/54ab38ac49296b3d3db44b9c9155a66ad0a7618961ff3e177fb4f559afa4ffe1.json
  - graphify-out/cache/semantic/a2b958060ec2d3b4508d31d6971d50d0e6a64844c1e7c0c01b083d33489d3c0d.json
  - graphify-out/cache/semantic/f9ff791c6c95d9dace67f1dd389321f368be5e4f837d02d9b75cda2c9be5dd94.json
  - graphify-out/cache/semantic/3025b0a360bd70abc9dff168bf1d371298a81728f306e0e32e87c1c700b7efb4.json
  - graphify-out/cache/semantic/a6374249375dd8a9efff3bd1f6a04d4ca0eb9a70299b6606577ef6065af1f084.json
  - graphify-out/cache/semantic/6fb4fba0c01239bb87d523d630b860ba4f4bfe6582b17d584cc4399ae063b101.json
  - graphify-out/cache/semantic/a4465690110f5ae8122d600b92075817e1440fcf046d2c5e6b8d296ca847b67b.json
  - graphify-out/cache/semantic/daf278620d4dce79dde6a74e52afdbe79337e5a39a52b471466b465e31577c09.json
  - graphify-out/cache/semantic/81f4c75b353262641a5e34172c5958cebdd59e607b813c9fb4bd76ae84b9b7ea.json
  - graphify-out/cache/ast/v0.8.44/d6df45b4de58cef579af121ff7f7566b0ba52fd06a19a5cb430d5cbae3ce4d6f.json
  - graphify-out/cache/semantic/d91c8c175fca7bd335cb800646b1a492e4a662f79390efc2a33bef2cc9e19e1d.json
  - graphify-out/cache/semantic/26ce1273ad133a0943228a5f07176c95ed385bb450fdcf635c9629eb11621a84.json
  - graphify-out/cache/semantic/2a8876b5505120f3fe877e9533e2214b87c3433eb97e9f0388b8fb5cc8f32866.json
  - graphify-out/cache/semantic/5ee64324ff95f7839fb497b56695cf288bea332857b56986fe405268b6803d66.json
  - graphify-out/cache/semantic/d120bbd6b8d2ee7db78c923dd58afaff727f0262ca47e6660adde5037d2f61c4.json
  - graphify-out/cache/semantic/5756b578c1afc6e11f3fde8c1ed6d68c8c903b5508dc9500c5e1f5135a9a0a0b.json
  - graphify-out/cache/semantic/b66d270a3455b7bc99742d45ff12c848546009e7fbb74e6a8de39b732501ee96.json
  - graphify-out/cache/semantic/6925e2c9eb7efa0e29184bc0d02eaaa250dfc98fccf8d8cd4cf68ca21fbcd5d5.json
  - graphify-out/cache/semantic/be648dbaee8066094a541dacb6060328b8a395264776b75545240716c70c2c54.json
  - graphify-out/cache/semantic/61460724ea9d23dc20c656a37426157b0e519f47dd45e82d254d1113912fb117.json
  - graphify-out/cache/semantic/5d6b8379ba1c8eb39bc57ea5450eb2162bb7e3806798c49b6ba58b28235b744d.json
  - graphify-out/cache/semantic/9c63cd450cdf464ef8e8fd3002d62dda77d8d0950fbcbca13a53fa3735670d98.json
  - graphify-out/cache/semantic/1702c55b9f7996536329d87c20db315b2aa0537fd4bcdb916fd329cf221f152c.json
  - graphify-out/cache/semantic/c0558d27b20437347205804cb156633e5e4318491bbbed2184098d8bd82cf857.json
  - graphify-out/cache/semantic/c3a4b0bb1b96432b0d26e46a5200399619a1f0af8ab7e2fc973c25811223beb8.json
  - graphify-out/cache/semantic/d1f2194401dbb84e56c98a0d166ee228a61e1175ac3d0b8b513f4cf7399a9ea4.json
  - graphify-out/cache/semantic/f4a12812264edfe4063c229a68b86f446f154f6f29439337006c756f9dc82e09.json
  - graphify-out/cache/semantic/dd2711dd2c80914697cdee0a471a409e096e25ebf9e298d7884ffdedc51c4c60.json
  - graphify-out/cache/ast/v0.8.44/574a84a9392c4f7ba5faf7475dd2c1d7b47c5476408d1bce4faba800bc0a9a4a.json
  - graphify-out/cache/semantic/75e5a0f05909f655e6a1f7927048d5903731c8755a6ac6896088eee442e6042e.json
  - graphify-out/cache/semantic/0f14e768c70859ccdc771b8faa81a78f97d20ef64f028b072a6bcd6b62ea13d4.json
  - graphify-out/cache/semantic/be8ae53a6205061665afe5fef67c7b9f64241ef737c45035709b2bc912c0df69.json
  - graphify-out/cache/semantic/4789a8b4cf6e254a9bcc95b905f26917ea83cca88926cc6bde195071a6a99a63.json
  - graphify-out/cache/semantic/474baa2bcd237c68c96539c6f68e8b7a461198d9560632c9fce4c1c39819c926.json
  - graphify-out/cache/semantic/c989cd2911893853a4941e7d5eb1ca7a33ca87f50ef0432adcb463b7395b399f.json
  - graphify-out/cache/semantic/4a50fd8270b73057457032bc7ffb79fbbce30e0f36b96c1ee7f133dc816e81a7.json
  - graphify-out/cache/semantic/541e16aa32fc813d570f5b7f8be9a7970424c341c08ac414d96dc53421c69116.json
  - graphify-out/cache/semantic/3b233a6754cae6a7ec00c998eb21db4e5869c5ec5875f891ce89a03cec9cf58f.json
  - graphify-out/cache/semantic/02bfe00789d054a7c76f739fc6c398adedb8e1dbbf9722b281f6d92bf83a0271.json
  - graphify-out/cache/semantic/ae698ef095bfc85aafac8e304f12e477c267a32199fd6cd7a102fcd5113c9e2b.json
  - graphify-out/cache/semantic/9f10a77fb1d452119cee51a37c77e354e394ce2fbbde2af3dde534f019c0e339.json
  - graphify-out/cache/semantic/9a6a4c4b2ba07576235e946bb844fa5b06717fa6381da99e8fcef09959133ed7.json
  - graphify-out/cache/ast/v0.8.44/4c0d430e23e0a32d12234431b56a6b60af0ea7c7fb0f22ed31ed98b32453f006.json
  - graphify-out/cache/semantic/f5ca7834d7834443da40eb6aef590d58330024f930811f7a25300d004318a045.json
  - graphify-out/.graphify_root
  - graphify-out/cache/semantic/00840100e466a34f28d4590d8b5599e58ecb9abee7391661aeb1ef8d3395f971.json
  - graphify-out/cache/semantic/7589e46f60fc63aba488bb0cfc79a4141081c542ee24b779fb3aea03be915672.json
  - graphify-out/cache/semantic/9fc88904143587a712371d495e0baa42f5b1198b9d0203e7e70200cca5068520.json
  - graphify-out/cache/semantic/bc3763d64d10d52cfa9494181eaa5c0f3c83677582c34ab403fb0d0a03b0b3e8.json
  - graphify-out/cache/semantic/b49db37e0cfbd723612f081dc5c08247c8b0f09c8b3c9b54ed329b9936947549.json
  - graphify-out/cache/semantic/82d5f0c6ae9106955bb06e634959b449b88ef946632cd422fca2b774d162a0ab.json
  - graphify-out/cache/semantic/c8095da5318802edff81d93935072ba324aee73b6a95ecddc0875a6504058560.json
  - graphify-out/cache/semantic/dbbe74f34f30470277fbe432f4b3e751f22f4760c3db01619adbad3f9043ba76.json
  - graphify-out/cache/ast/v0.8.44/d8003394aa45c3820bd613b17355e0e97b5267f821949a3bce464129cfa19158.json
  - graphify-out/cache/semantic/c7847137a048d9bdc3be7a2454190d30a1ce34963b27703ebfe3db2aef6436ee.json
  - graphify-out/cache/semantic/ab003bd3904987bac1962a597b922b0d3ac10e05823a6e285f0e65c15ac5f308.json
  - graphify-out/cache/semantic/d5c563bd888151e85553cb3f1153d6a8b62de905674e3a831169488d76172cea.json
  - graphify-out/cache/ast/v0.8.44/ff7bb897cccbbf5a2d4fcac2c213a9438078ac2df0fb3069a1f15fa88912ca47.json
  - graphify-out/cache/semantic/87ce33d2f7eff5da8b80b13d868bc00a1a5acbb776d5a8fee607abec9ab2e574.json
  - graphify-out/cache/semantic/f7dd8aa42cca86a382392629232ffbfa27ceae5ac4c42de704fbbf88b70de328.json
  - graphify-out/cache/ast/v0.8.44/40ee6cb0a8e93cbd0e7c5bd318e52dd3612b55b848b72b8b8d72c2dac71f3372.json
  - graphify-out/cache/semantic/c3414687ca9085d30bc796743322363bb5513370abd08625f910a9639cd8cbf6.json
  - graphify-out/cache/semantic/aed2536aa56856ebcb5610c6c364cac37543bcab09234ad89716e7a1f62cef46.json
  - graphify-out/cache/semantic/247820da0d7d6fd13800421af373a0051f1b521ec1a9fe8335aeb30a4a8e1c28.json
  - graphify-out/cache/ast/v0.8.44/4cbcd914a9bb5d5b6be63fcba8aa1457ebf94009d55941c038bc072de375cb28.json
  - graphify-out/cache/ast/v0.8.44/1a786b9bb2244dd4f1b26e79bb246848b38636d8fd314425571555f4cda91a87.json
  - graphify-out/cache/semantic/4f24acc4f4d5af198fc81a0dbc4733eec52544c405014dd46d2e0f5c9d4c3d35.json
  - graphify-out/cache/semantic/540e1759cf0c1e149d246eba0ad69767f686b31103fe1835682fc0de4bb2e566.json
  - graphify-out/cache/semantic/955780e0901822aec0e4050ebf07de2591dc412e4ab002882599f0a5200243b4.json
  - graphify-out/cache/semantic/f05794463e030a9105ec4c529341bccdca5ca2f1abe61576822dd572d9659370.json
  - graphify-out/manifest.json
  - graphify-out/cache/semantic/3f720e7a0c4ce9caabcf02bfabd5914f765f216e40473d539ed43c42039c9aed.json
  - graphify-out/cache/semantic/2dc3d5c57a5d1b9b7824ea72fea16a68cbbd28b228f9c27bccbf620cf66e2167.json
  - graphify-out/cache/semantic/fd9c53ae1e751e2ae2260fa07ee2be45e6cbf9237cf2f3b6b3dcededc102f315.json
  - graphify-out/cache/semantic/b7f587b2470ba2c4bcde54aa271fef31b971c9f38ffe042653e0a012298e90b5.json
  - graphify-out/cache/semantic/fd59ec92a6cccb9090d6b1e1f31d724cc3dc7324d1af5a83a36fe9303a2fd813.json
  - graphify-out/cache/semantic/62553e59426aedfa0e45bfd9efd1a08a6864607d01d6d414646ca26bfc26004d.json
  - graphify-out/cache/semantic/fed7ca43d67afc83f5c49765461f5028ab8ac6cf8d0f274497200be60a74a894.json
  - graphify-out/cache/semantic/167919c3766baabe568b03d75c9a9983154aeaa8513b9606fbbe035b8ecc5504.json
  - graphify-out/cache/semantic/953298b01ebb47f4f0ac33ec322570c8a1f0f71c54751d6e764cb3ee8fac5b82.json
  - graphify-out/cache/semantic/b33c9c10f2abdfd280a1286796f706ca01930aeb2cb3f1e34e6857b716f89c8c.json
  - graphify-out/cache/semantic/60447ca4eb9241f515f5567d5465d99f8abdf76ead0faf8a8ff83ff1a020d1d5.json
-->

---
### Requirement: Hard Rules template contains only project-specific examples

The Hard Rules template in the pattern library SHALL contain numbered rules in the format matching the canonical template (`src/project_root_structure/CLAUDE.md`).

The Hard Rules template SHALL NOT contain generic "Always" or "Never" items that duplicate content from `.claude/CLAUDE.md` Core Principles, Anti-Slop Discipline, or Commit & PR Hygiene sections.

#### Scenario: Hard Rules template uses numbered format

- **WHEN** an advisor reads the Hard Rules template section
- **THEN** the template shows numbered rules (e.g., `1. Run npm run type-check after every change.`)
- **THEN** no "Always:" or "Never:" bullet blocks appear in the Hard Rules template

<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
-->


<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - graphify-out/cache/semantic/c4cef9b68f5d53ba3b0268a466f90deabffe74154321145184b3b2c92e746c47.json
  - graphify-out/cache/semantic/15c28e7fc33562bf54735dc883e1b5556988ee081fbd3fad807dcd31c0751ec1.json
  - graphify-out/cache/semantic/78518ab7963f8511fc607597b22dae8ebb564602434ca1fc7ffd78ee0fe3a01d.json
  - graphify-out/cache/semantic/2fa27eda4acec43176597698e8553329e00337605047a0d65c1dc5157eea1528.json
  - graphify-out/cache/semantic/7df3d22a3e9933b090589d51ffd2dcdac7442cab01624370288c9ae1148484df.json
  - graphify-out/cache/semantic/c63a18be7c1092b5324a482f233dd8dc17de7af28cab99175d16a92dc6af697b.json
  - graphify-out/cache/semantic/c7c895c90d89e9cd9b4e3950590a81c04e83b4d1fff8e0b4985435060d8e2eb9.json
  - graphify-out/cache/semantic/d6d037cc5fbc7f991cb8b3f41afd2685e8d32201496ee70b13055178e770a907.json
  - graphify-out/cost.json
  - graphify-out/cache/semantic/52de177e49e90a8849d74fcb83feafbe2e4ec428844bfa6bc4227fde909b9042.json
  - graphify-out/cache/semantic/e055b4f794da960d908bea90943d253190690f94af54e90a3eb6a029e5aea58e.json
  - graphify-out/cache/semantic/7c3f4d5c900b4f4774dac25cab0e2193d78a9d8f992d110196364b40457397cf.json
  - graphify-out/cache/semantic/48cbc27761ac6c919aeffa938d8e1129f86a04c26a53a954378922df698a63ce.json
  - .spectra/changes/align-claudemd-patterns-with-canonical-template.started
  - graphify-out/cache/semantic/daa73c5435f7b5ad6f4a04c8cfbc3da2d6a2ce62eb3ff576aff66335c99a7457.json
  - graphify-out/cache/semantic/e4f4acbb4beeddb600a3af72243316e83b9cf9dfd1be35af32e8ec3dfc13bcc6.json
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
  - graphify-out/cache/semantic/9e7decb73db7ffe161d67b92498a21e9a394034ddf08c19755b7d05ec7731735.json
  - graphify-out/cache/semantic/4024cd44fe7eb512c253fc8c63e96a4c8347e1757f72221d9c6ba6ee0c114bfa.json
  - graphify-out/cache/semantic/1f81019a83c967ad2bff838f8db3a62e608bf48a1f0debe5620bd6affe1676fc.json
  - graphify-out/cache/semantic/dc4407acf80a2367a6be36386c0a9adf2747203d1ea70b44f00e365fb3580161.json
  - graphify-out/cache/semantic/82adcadd1a8760e736381f7a49c9f0388698463e0247a704b3255e298da07212.json
  - graphify-out/cache/semantic/2e4339fde919b35034bfbdc20fb389ab84c2dafb0903e02d667cca34cf3c897e.json
  - graphify-out/cache/semantic/dd0ec26f34c083ae04cfb9ad4a2adfa0211411e59561f734f6d4bfb27bb3ffcb.json
  - graphify-out/cache/semantic/e3fc9770dd41d6f2644a6639301106aa884224d2a6b229592d6368e30d0e6d98.json
  - graphify-out/cache/semantic/c11e49d44a30451e73022776ec8bf6611ce281ee1558dca047bfcf3711c179c3.json
  - graphify-out/cache/semantic/13ac9d0b782317033702a3f801ca5451018892a6a8699788b604b9777b447291.json
  - graphify-out/cache/semantic/bb57a7f92284356a308ce79bfb412ceaa58c07712d6902d4f672efe5d614fa2b.json
  - graphify-out/cache/semantic/35e96865a88747101f22c03654755f935a1d83a69cc0b44c8d50b03e7d9e9086.json
  - graphify-out/.graphify_labels.json
  - graphify-out/cache/semantic/7f1b10bc66d9b86304c6a7759eab4e5296fb495fdf7fd1710cee02705f6d48da.json
  - graphify-out/cache/semantic/bd8628dac7e60e3f2349146f4c1afc12cb217fbb20cc93aa4bb946cb66cdb833.json
  - graphify-out/cache/semantic/485812515c1974342c86c214b769195c6be6a2ca4250f3ccbec8cb4ce8d91007.json
  - graphify-out/cache/semantic/be8a5fb5fa02ce9d4a7179cafb3aee29f7249c0e438b362ccae8110d3a3b9272.json
  - graphify-out/cache/semantic/e18a9fc4cf081e1d4a10f5a82f97a1121819c544ce0e4129347b3e03a5172005.json
  - graphify-out/cache/semantic/286ef28cf6d6f2f33e272b4fe0fba67e71f1d7717093eab6e27588c3d3f5a4ff.json
  - graphify-out/cache/semantic/13b6b88f2a7837fab8e96a50cbb227977056f928248f73f3226ae1d8477eb659.json
  - graphify-out/graph.json
  - graphify-out/cache/semantic/3215f3dc0a999839c33faf1083b8a42be23ffca4922077749ae511cd60ed4dac.json
  - graphify-out/cache/semantic/404e3194ef9150686ce079cc651fc37fe4fc76ad7c450ba3d0c3c3041e2714f4.json
  - graphify-out/cache/semantic/bf9dffdaf41d9f55c80a5fbbc8ecf36afb4e0662f13e71d204d471404f46e64c.json
  - graphify-out/cache/semantic/9d3548f299f2196d47bae975d57ffb5ab44924a1c848f32f479be269b7661d4c.json
  - graphify-out/cache/semantic/8499901ca09af81499ec7a32b524ef190776b34b11cd4d0596960e025f12657f.json
  - graphify-out/cache/semantic/f7f3020cb12a9191ae6f1b5c2f9d6b3a0487c82a4395d97696470514e1a4c06b.json
  - graphify-out/cache/semantic/3255d8ab6709240ca1afb52b90a2fe6c7f167ca095b21f3178b742835cbd43d2.json
  - graphify-out/cache/semantic/b78cd456c3da6afeda800a2b76a55fc339266beb28f04e9d4fc796879cc4788b.json
  - graphify-out/cache/semantic/241717c78c067f69d5acc2a7de091374647ac49336ac243f68225b911dfdb8e4.json
  - graphify-out/cache/semantic/d8be7b99474994cd01a3b7b596c2626592bfc8d42c883ce6d482e21b8ac1611a.json
  - graphify-out/cache/semantic/a65abc71a5912237bd19f84197c462293b1d92a6024db89fab88bb8805d321f0.json
  - graphify-out/cache/semantic/c42fd4d8c851e352ed8de27ccdc82d050b437c7b1c31703235c84d971a6ca5a8.json
  - graphify-out/cache/semantic/b450a2671cd153f5f2d00793595fa0c1461792d63c5d5afd51da7c92659f2509.json
  - graphify-out/cache/semantic/ca72404d5d8b8c1a042dbfa4fb6eefedb7a10b8e0a86d60429dd975fa244ee98.json
  - graphify-out/cache/ast/v0.8.44/e011bb38d69ce6ca916bef32ca23a596e111394a4a69d0bac01f6d4422e692e1.json
  - graphify-out/cache/semantic/1564278f786f145208f4418becb5e087e9c305f6925bee8db1e556b78f4258d0.json
  - graphify-out/cache/semantic/d66cc6e97d687710eeaa911c471df04f217036251d48120dbd18961e72bf7121.json
  - graphify-out/cache/semantic/4fc46ba057e42a58981e3b5845c2d8974228c4ae2736e4b2273b943337e46c92.json
  - graphify-out/cache/semantic/df15782a31b1a17a4ec6de7d1336652c180835fab3f5904ae60bdb1a5698dd7a.json
  - graphify-out/cache/semantic/ec69655b3b3b01c696ea4696bbfd9d4455410a5e8e60217552a1039609ea6c3c.json
  - tasks/borisChernyClaudeMd.md
  - graphify-out/cache/semantic/04711698dd67d226450aff32ebbcb0d03280f19df052922e269f5bd6558f745a.json
  - graphify-out/cache/semantic/c818f33f9faa844e783d03754b9220ca81330a51e7cff8a3d4750eef9960af37.json
  - graphify-out/cache/semantic/c19b330cf7eda3314f82d2e3995955a9f97661895cff654c343cb02d4eff8294.json
  - graphify-out/cache/semantic/53f5c9056957bfdfc52b7d5187cc54af36864996abe4d38b2a70f53995c4ab90.json
  - graphify-out/cache/semantic/31681bb6a086dc2cb06da8c2e69c6d452499902a73073df8dd4d978975d4faa2.json
  - graphify-out/cache/semantic/eb5298226491b7442598f9532f7e9f8d95a3e6ffa1444e6db4fca41bc697d806.json
  - graphify-out/cache/semantic/ac382c6bd763edf573332f6b3aec6aaf9e01f35968babe9069414adebc1c7a13.json
  - graphify-out/cache/semantic/69d13ca8396d00817412c2c7e6711bf820df603c09ee2678464796c4e5fd6515.json
  - graphify-out/cache/semantic/fca81a20b67bc38d9cb8e07ced890d85d4e24c885e26fe561e779d14233d82dc.json
  - graphify-out/cache/semantic/5176ad8f26bf991a7c0e10f56b20305115ecf74fb1520b25a4232d5838d6f2d2.json
  - graphify-out/GRAPH_REPORT.md
  - graphify-out/cache/semantic/1f458a9dac9a1bacbfa28306be5ba67e8a42f3edd48f4d609ad11ce5f3fe9847.json
  - graphify-out/cache/semantic/de4e06f586c9cf9b2b3cd358c26b7bebdb9454198fd28e3b95873969427a50e5.json
  - graphify-out/cache/semantic/75502fb7cc6f0cb7677ad72e6adffa007d7520d315fc2576e88c5ae741d03d41.json
  - graphify-out/cache/semantic/ea8ee411b24a1286d1ad1b24a8948c695952668ad602bfe7378946a724a75f8c.json
  - graphify-out/cache/ast/v0.8.44/b604d3648f723b98f741bf48633af4bc73344e137fd8f08a75f0cd81f49e58fa.json
  - graphify-out/cache/ast/v0.8.44/f48dbf5cad37229732280de2fda8eae627b2aa5efcb41f24986c323a3c5f9365.json
  - graphify-out/cache/semantic/3930ce8cdef5dbbf2a09d93923542a9911b9cc31aa80defa00393a634d265d08.json
  - graphify-out/cache/semantic/55a2d2362807d714499f4a2731e47a668fe5d867b8074af3a56ada31b5677943.json
  - graphify-out/cache/semantic/5b7b5a7fed6b6830355510472a9d03b7e549a1ffa65ec815905fee3d2baf2a3b.json
  - graphify-out/cache/ast/v0.8.44/4c09477cadc21a4125c7c57a2434a8696b1fee71f23dd172ecd7ea200955dd99.json
  - graphify-out/cache/semantic/60e15b393d612db5336a22d4e6adbb3c6c51fa07dbf16cc01a794bc436a62861.json
  - graphify-out/cache/ast/v0.8.44/386401368c66971a3f07a3f56ce8ab9e9153901112b190a4fcf2051c46bdc075.json
  - graphify-out/cache/semantic/7a25d0e1e941fd88d83e5880cd325a48a732ca2640952633f93bc344a0828999.json
  - graphify-out/cache/semantic/83afb8f39e9f95c5645049720d7b497b21920a23ac1ab11512676952326f5299.json
  - graphify-out/cache/semantic/a0ebeb44f7244d90ac5d612fd8e12a240d649ef3c382dbed0fb025b237089985.json
  - graphify-out/graph.html
  - graphify-out/cache/semantic/ed70251e58da3816c8644df29b2b5211e6d74ce7dd816a8654061746ede7e088.json
  - graphify-out/cache/semantic/af0dd5d8d360c157a22c28e89f7697ec95ac0fe4d490e56d1494a904175328e1.json
  - graphify-out/cache/stat-index.json
  - graphify-out/cache/semantic/418ba54c8dcecb21bb27ae58b81e1ab8c98cf655be66267abe1a777858852cf2.json
  - graphify-out/cache/ast/v0.8.44/4ddf5e9458a8a22b201cb0a90a5770643b7d39577622a5b279934c859ce3aef2.json
  - graphify-out/cache/semantic/764b7b7b7656f817e99db4289295b968b5e4a0aa0ba032eaddc6876c21e84634.json
  - graphify-out/cache/semantic/f8e1222dff223e7119d52904f365a2458761491296730d73111d756418063a03.json
  - graphify-out/cache/semantic/e8f9cad313f2fb81dc8f5c5a42955feb9069c4486403d3b8fc01a1b44f02c407.json
  - graphify-out/cache/semantic/46f2b5ebd08d708504f4259f39868ddfdf15109366acaa4069b47f5fa3d01acc.json
  - graphify-out/cache/semantic/03eaf00cbe965e62ceffcc98127b2c4075b9e6c737ed54e1eea3ea6bd8caaefc.json
  - graphify-out/cache/semantic/d549692471c10078e73a087548268c9298907c60873fe991c04136fba1624c7b.json
  - graphify-out/.graphify_python
  - graphify-out/cache/semantic/1d06a280f0b5d6431aad69f6d259cd93941119675d2fde409f12e45afd0e634b.json
  - graphify-out/cache/semantic/37eb647b8cef4372462e4faf10b53e055f762b754de2a289b2b06f1275f08873.json
  - graphify-out/cache/ast/v0.8.44/42cf34065153763fb0663ed89879c6e50fcdb7753b6397b6a33d38518c3aea3c.json
  - graphify-out/cache/semantic/8515b018028115764b5136669a62294b4b3c33e5f9357488f180d4fb5c6e5e10.json
  - graphify-out/cache/semantic/54ab38ac49296b3d3db44b9c9155a66ad0a7618961ff3e177fb4f559afa4ffe1.json
  - graphify-out/cache/semantic/a2b958060ec2d3b4508d31d6971d50d0e6a64844c1e7c0c01b083d33489d3c0d.json
  - graphify-out/cache/semantic/f9ff791c6c95d9dace67f1dd389321f368be5e4f837d02d9b75cda2c9be5dd94.json
  - graphify-out/cache/semantic/3025b0a360bd70abc9dff168bf1d371298a81728f306e0e32e87c1c700b7efb4.json
  - graphify-out/cache/semantic/a6374249375dd8a9efff3bd1f6a04d4ca0eb9a70299b6606577ef6065af1f084.json
  - graphify-out/cache/semantic/6fb4fba0c01239bb87d523d630b860ba4f4bfe6582b17d584cc4399ae063b101.json
  - graphify-out/cache/semantic/a4465690110f5ae8122d600b92075817e1440fcf046d2c5e6b8d296ca847b67b.json
  - graphify-out/cache/semantic/daf278620d4dce79dde6a74e52afdbe79337e5a39a52b471466b465e31577c09.json
  - graphify-out/cache/semantic/81f4c75b353262641a5e34172c5958cebdd59e607b813c9fb4bd76ae84b9b7ea.json
  - graphify-out/cache/ast/v0.8.44/d6df45b4de58cef579af121ff7f7566b0ba52fd06a19a5cb430d5cbae3ce4d6f.json
  - graphify-out/cache/semantic/d91c8c175fca7bd335cb800646b1a492e4a662f79390efc2a33bef2cc9e19e1d.json
  - graphify-out/cache/semantic/26ce1273ad133a0943228a5f07176c95ed385bb450fdcf635c9629eb11621a84.json
  - graphify-out/cache/semantic/2a8876b5505120f3fe877e9533e2214b87c3433eb97e9f0388b8fb5cc8f32866.json
  - graphify-out/cache/semantic/5ee64324ff95f7839fb497b56695cf288bea332857b56986fe405268b6803d66.json
  - graphify-out/cache/semantic/d120bbd6b8d2ee7db78c923dd58afaff727f0262ca47e6660adde5037d2f61c4.json
  - graphify-out/cache/semantic/5756b578c1afc6e11f3fde8c1ed6d68c8c903b5508dc9500c5e1f5135a9a0a0b.json
  - graphify-out/cache/semantic/b66d270a3455b7bc99742d45ff12c848546009e7fbb74e6a8de39b732501ee96.json
  - graphify-out/cache/semantic/6925e2c9eb7efa0e29184bc0d02eaaa250dfc98fccf8d8cd4cf68ca21fbcd5d5.json
  - graphify-out/cache/semantic/be648dbaee8066094a541dacb6060328b8a395264776b75545240716c70c2c54.json
  - graphify-out/cache/semantic/61460724ea9d23dc20c656a37426157b0e519f47dd45e82d254d1113912fb117.json
  - graphify-out/cache/semantic/5d6b8379ba1c8eb39bc57ea5450eb2162bb7e3806798c49b6ba58b28235b744d.json
  - graphify-out/cache/semantic/9c63cd450cdf464ef8e8fd3002d62dda77d8d0950fbcbca13a53fa3735670d98.json
  - graphify-out/cache/semantic/1702c55b9f7996536329d87c20db315b2aa0537fd4bcdb916fd329cf221f152c.json
  - graphify-out/cache/semantic/c0558d27b20437347205804cb156633e5e4318491bbbed2184098d8bd82cf857.json
  - graphify-out/cache/semantic/c3a4b0bb1b96432b0d26e46a5200399619a1f0af8ab7e2fc973c25811223beb8.json
  - graphify-out/cache/semantic/d1f2194401dbb84e56c98a0d166ee228a61e1175ac3d0b8b513f4cf7399a9ea4.json
  - graphify-out/cache/semantic/f4a12812264edfe4063c229a68b86f446f154f6f29439337006c756f9dc82e09.json
  - graphify-out/cache/semantic/dd2711dd2c80914697cdee0a471a409e096e25ebf9e298d7884ffdedc51c4c60.json
  - graphify-out/cache/ast/v0.8.44/574a84a9392c4f7ba5faf7475dd2c1d7b47c5476408d1bce4faba800bc0a9a4a.json
  - graphify-out/cache/semantic/75e5a0f05909f655e6a1f7927048d5903731c8755a6ac6896088eee442e6042e.json
  - graphify-out/cache/semantic/0f14e768c70859ccdc771b8faa81a78f97d20ef64f028b072a6bcd6b62ea13d4.json
  - graphify-out/cache/semantic/be8ae53a6205061665afe5fef67c7b9f64241ef737c45035709b2bc912c0df69.json
  - graphify-out/cache/semantic/4789a8b4cf6e254a9bcc95b905f26917ea83cca88926cc6bde195071a6a99a63.json
  - graphify-out/cache/semantic/474baa2bcd237c68c96539c6f68e8b7a461198d9560632c9fce4c1c39819c926.json
  - graphify-out/cache/semantic/c989cd2911893853a4941e7d5eb1ca7a33ca87f50ef0432adcb463b7395b399f.json
  - graphify-out/cache/semantic/4a50fd8270b73057457032bc7ffb79fbbce30e0f36b96c1ee7f133dc816e81a7.json
  - graphify-out/cache/semantic/541e16aa32fc813d570f5b7f8be9a7970424c341c08ac414d96dc53421c69116.json
  - graphify-out/cache/semantic/3b233a6754cae6a7ec00c998eb21db4e5869c5ec5875f891ce89a03cec9cf58f.json
  - graphify-out/cache/semantic/02bfe00789d054a7c76f739fc6c398adedb8e1dbbf9722b281f6d92bf83a0271.json
  - graphify-out/cache/semantic/ae698ef095bfc85aafac8e304f12e477c267a32199fd6cd7a102fcd5113c9e2b.json
  - graphify-out/cache/semantic/9f10a77fb1d452119cee51a37c77e354e394ce2fbbde2af3dde534f019c0e339.json
  - graphify-out/cache/semantic/9a6a4c4b2ba07576235e946bb844fa5b06717fa6381da99e8fcef09959133ed7.json
  - graphify-out/cache/ast/v0.8.44/4c0d430e23e0a32d12234431b56a6b60af0ea7c7fb0f22ed31ed98b32453f006.json
  - graphify-out/cache/semantic/f5ca7834d7834443da40eb6aef590d58330024f930811f7a25300d004318a045.json
  - graphify-out/.graphify_root
  - graphify-out/cache/semantic/00840100e466a34f28d4590d8b5599e58ecb9abee7391661aeb1ef8d3395f971.json
  - graphify-out/cache/semantic/7589e46f60fc63aba488bb0cfc79a4141081c542ee24b779fb3aea03be915672.json
  - graphify-out/cache/semantic/9fc88904143587a712371d495e0baa42f5b1198b9d0203e7e70200cca5068520.json
  - graphify-out/cache/semantic/bc3763d64d10d52cfa9494181eaa5c0f3c83677582c34ab403fb0d0a03b0b3e8.json
  - graphify-out/cache/semantic/b49db37e0cfbd723612f081dc5c08247c8b0f09c8b3c9b54ed329b9936947549.json
  - graphify-out/cache/semantic/82d5f0c6ae9106955bb06e634959b449b88ef946632cd422fca2b774d162a0ab.json
  - graphify-out/cache/semantic/c8095da5318802edff81d93935072ba324aee73b6a95ecddc0875a6504058560.json
  - graphify-out/cache/semantic/dbbe74f34f30470277fbe432f4b3e751f22f4760c3db01619adbad3f9043ba76.json
  - graphify-out/cache/ast/v0.8.44/d8003394aa45c3820bd613b17355e0e97b5267f821949a3bce464129cfa19158.json
  - graphify-out/cache/semantic/c7847137a048d9bdc3be7a2454190d30a1ce34963b27703ebfe3db2aef6436ee.json
  - graphify-out/cache/semantic/ab003bd3904987bac1962a597b922b0d3ac10e05823a6e285f0e65c15ac5f308.json
  - graphify-out/cache/semantic/d5c563bd888151e85553cb3f1153d6a8b62de905674e3a831169488d76172cea.json
  - graphify-out/cache/ast/v0.8.44/ff7bb897cccbbf5a2d4fcac2c213a9438078ac2df0fb3069a1f15fa88912ca47.json
  - graphify-out/cache/semantic/87ce33d2f7eff5da8b80b13d868bc00a1a5acbb776d5a8fee607abec9ab2e574.json
  - graphify-out/cache/semantic/f7dd8aa42cca86a382392629232ffbfa27ceae5ac4c42de704fbbf88b70de328.json
  - graphify-out/cache/ast/v0.8.44/40ee6cb0a8e93cbd0e7c5bd318e52dd3612b55b848b72b8b8d72c2dac71f3372.json
  - graphify-out/cache/semantic/c3414687ca9085d30bc796743322363bb5513370abd08625f910a9639cd8cbf6.json
  - graphify-out/cache/semantic/aed2536aa56856ebcb5610c6c364cac37543bcab09234ad89716e7a1f62cef46.json
  - graphify-out/cache/semantic/247820da0d7d6fd13800421af373a0051f1b521ec1a9fe8335aeb30a4a8e1c28.json
  - graphify-out/cache/ast/v0.8.44/4cbcd914a9bb5d5b6be63fcba8aa1457ebf94009d55941c038bc072de375cb28.json
  - graphify-out/cache/ast/v0.8.44/1a786b9bb2244dd4f1b26e79bb246848b38636d8fd314425571555f4cda91a87.json
  - graphify-out/cache/semantic/4f24acc4f4d5af198fc81a0dbc4733eec52544c405014dd46d2e0f5c9d4c3d35.json
  - graphify-out/cache/semantic/540e1759cf0c1e149d246eba0ad69767f686b31103fe1835682fc0de4bb2e566.json
  - graphify-out/cache/semantic/955780e0901822aec0e4050ebf07de2591dc412e4ab002882599f0a5200243b4.json
  - graphify-out/cache/semantic/f05794463e030a9105ec4c529341bccdca5ca2f1abe61576822dd572d9659370.json
  - graphify-out/manifest.json
  - graphify-out/cache/semantic/3f720e7a0c4ce9caabcf02bfabd5914f765f216e40473d539ed43c42039c9aed.json
  - graphify-out/cache/semantic/2dc3d5c57a5d1b9b7824ea72fea16a68cbbd28b228f9c27bccbf620cf66e2167.json
  - graphify-out/cache/semantic/fd9c53ae1e751e2ae2260fa07ee2be45e6cbf9237cf2f3b6b3dcededc102f315.json
  - graphify-out/cache/semantic/b7f587b2470ba2c4bcde54aa271fef31b971c9f38ffe042653e0a012298e90b5.json
  - graphify-out/cache/semantic/fd59ec92a6cccb9090d6b1e1f31d724cc3dc7324d1af5a83a36fe9303a2fd813.json
  - graphify-out/cache/semantic/62553e59426aedfa0e45bfd9efd1a08a6864607d01d6d414646ca26bfc26004d.json
  - graphify-out/cache/semantic/fed7ca43d67afc83f5c49765461f5028ab8ac6cf8d0f274497200be60a74a894.json
  - graphify-out/cache/semantic/167919c3766baabe568b03d75c9a9983154aeaa8513b9606fbbe035b8ecc5504.json
  - graphify-out/cache/semantic/953298b01ebb47f4f0ac33ec322570c8a1f0f71c54751d6e764cb3ee8fac5b82.json
  - graphify-out/cache/semantic/b33c9c10f2abdfd280a1286796f706ca01930aeb2cb3f1e34e6857b716f89c8c.json
  - graphify-out/cache/semantic/60447ca4eb9241f515f5567d5465d99f8abdf76ead0faf8a8ff83ff1a020d1d5.json
-->

---
### Requirement: Commands section template present

The pattern library SHALL include a Commands section template with fill-in fields for:
- Dev command
- Build command
- Test file command
- Test all command
- Lint command
- Types command

#### Scenario: Commands template is findable in the document

- **WHEN** an advisor searches claudemd-patterns.md for a Commands section
- **THEN** a template with `<FILL IN>` placeholders for dev/build/test/lint/types commands exists

<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
-->


<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - graphify-out/cache/semantic/c4cef9b68f5d53ba3b0268a466f90deabffe74154321145184b3b2c92e746c47.json
  - graphify-out/cache/semantic/15c28e7fc33562bf54735dc883e1b5556988ee081fbd3fad807dcd31c0751ec1.json
  - graphify-out/cache/semantic/78518ab7963f8511fc607597b22dae8ebb564602434ca1fc7ffd78ee0fe3a01d.json
  - graphify-out/cache/semantic/2fa27eda4acec43176597698e8553329e00337605047a0d65c1dc5157eea1528.json
  - graphify-out/cache/semantic/7df3d22a3e9933b090589d51ffd2dcdac7442cab01624370288c9ae1148484df.json
  - graphify-out/cache/semantic/c63a18be7c1092b5324a482f233dd8dc17de7af28cab99175d16a92dc6af697b.json
  - graphify-out/cache/semantic/c7c895c90d89e9cd9b4e3950590a81c04e83b4d1fff8e0b4985435060d8e2eb9.json
  - graphify-out/cache/semantic/d6d037cc5fbc7f991cb8b3f41afd2685e8d32201496ee70b13055178e770a907.json
  - graphify-out/cost.json
  - graphify-out/cache/semantic/52de177e49e90a8849d74fcb83feafbe2e4ec428844bfa6bc4227fde909b9042.json
  - graphify-out/cache/semantic/e055b4f794da960d908bea90943d253190690f94af54e90a3eb6a029e5aea58e.json
  - graphify-out/cache/semantic/7c3f4d5c900b4f4774dac25cab0e2193d78a9d8f992d110196364b40457397cf.json
  - graphify-out/cache/semantic/48cbc27761ac6c919aeffa938d8e1129f86a04c26a53a954378922df698a63ce.json
  - .spectra/changes/align-claudemd-patterns-with-canonical-template.started
  - graphify-out/cache/semantic/daa73c5435f7b5ad6f4a04c8cfbc3da2d6a2ce62eb3ff576aff66335c99a7457.json
  - graphify-out/cache/semantic/e4f4acbb4beeddb600a3af72243316e83b9cf9dfd1be35af32e8ec3dfc13bcc6.json
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
  - graphify-out/cache/semantic/9e7decb73db7ffe161d67b92498a21e9a394034ddf08c19755b7d05ec7731735.json
  - graphify-out/cache/semantic/4024cd44fe7eb512c253fc8c63e96a4c8347e1757f72221d9c6ba6ee0c114bfa.json
  - graphify-out/cache/semantic/1f81019a83c967ad2bff838f8db3a62e608bf48a1f0debe5620bd6affe1676fc.json
  - graphify-out/cache/semantic/dc4407acf80a2367a6be36386c0a9adf2747203d1ea70b44f00e365fb3580161.json
  - graphify-out/cache/semantic/82adcadd1a8760e736381f7a49c9f0388698463e0247a704b3255e298da07212.json
  - graphify-out/cache/semantic/2e4339fde919b35034bfbdc20fb389ab84c2dafb0903e02d667cca34cf3c897e.json
  - graphify-out/cache/semantic/dd0ec26f34c083ae04cfb9ad4a2adfa0211411e59561f734f6d4bfb27bb3ffcb.json
  - graphify-out/cache/semantic/e3fc9770dd41d6f2644a6639301106aa884224d2a6b229592d6368e30d0e6d98.json
  - graphify-out/cache/semantic/c11e49d44a30451e73022776ec8bf6611ce281ee1558dca047bfcf3711c179c3.json
  - graphify-out/cache/semantic/13ac9d0b782317033702a3f801ca5451018892a6a8699788b604b9777b447291.json
  - graphify-out/cache/semantic/bb57a7f92284356a308ce79bfb412ceaa58c07712d6902d4f672efe5d614fa2b.json
  - graphify-out/cache/semantic/35e96865a88747101f22c03654755f935a1d83a69cc0b44c8d50b03e7d9e9086.json
  - graphify-out/.graphify_labels.json
  - graphify-out/cache/semantic/7f1b10bc66d9b86304c6a7759eab4e5296fb495fdf7fd1710cee02705f6d48da.json
  - graphify-out/cache/semantic/bd8628dac7e60e3f2349146f4c1afc12cb217fbb20cc93aa4bb946cb66cdb833.json
  - graphify-out/cache/semantic/485812515c1974342c86c214b769195c6be6a2ca4250f3ccbec8cb4ce8d91007.json
  - graphify-out/cache/semantic/be8a5fb5fa02ce9d4a7179cafb3aee29f7249c0e438b362ccae8110d3a3b9272.json
  - graphify-out/cache/semantic/e18a9fc4cf081e1d4a10f5a82f97a1121819c544ce0e4129347b3e03a5172005.json
  - graphify-out/cache/semantic/286ef28cf6d6f2f33e272b4fe0fba67e71f1d7717093eab6e27588c3d3f5a4ff.json
  - graphify-out/cache/semantic/13b6b88f2a7837fab8e96a50cbb227977056f928248f73f3226ae1d8477eb659.json
  - graphify-out/graph.json
  - graphify-out/cache/semantic/3215f3dc0a999839c33faf1083b8a42be23ffca4922077749ae511cd60ed4dac.json
  - graphify-out/cache/semantic/404e3194ef9150686ce079cc651fc37fe4fc76ad7c450ba3d0c3c3041e2714f4.json
  - graphify-out/cache/semantic/bf9dffdaf41d9f55c80a5fbbc8ecf36afb4e0662f13e71d204d471404f46e64c.json
  - graphify-out/cache/semantic/9d3548f299f2196d47bae975d57ffb5ab44924a1c848f32f479be269b7661d4c.json
  - graphify-out/cache/semantic/8499901ca09af81499ec7a32b524ef190776b34b11cd4d0596960e025f12657f.json
  - graphify-out/cache/semantic/f7f3020cb12a9191ae6f1b5c2f9d6b3a0487c82a4395d97696470514e1a4c06b.json
  - graphify-out/cache/semantic/3255d8ab6709240ca1afb52b90a2fe6c7f167ca095b21f3178b742835cbd43d2.json
  - graphify-out/cache/semantic/b78cd456c3da6afeda800a2b76a55fc339266beb28f04e9d4fc796879cc4788b.json
  - graphify-out/cache/semantic/241717c78c067f69d5acc2a7de091374647ac49336ac243f68225b911dfdb8e4.json
  - graphify-out/cache/semantic/d8be7b99474994cd01a3b7b596c2626592bfc8d42c883ce6d482e21b8ac1611a.json
  - graphify-out/cache/semantic/a65abc71a5912237bd19f84197c462293b1d92a6024db89fab88bb8805d321f0.json
  - graphify-out/cache/semantic/c42fd4d8c851e352ed8de27ccdc82d050b437c7b1c31703235c84d971a6ca5a8.json
  - graphify-out/cache/semantic/b450a2671cd153f5f2d00793595fa0c1461792d63c5d5afd51da7c92659f2509.json
  - graphify-out/cache/semantic/ca72404d5d8b8c1a042dbfa4fb6eefedb7a10b8e0a86d60429dd975fa244ee98.json
  - graphify-out/cache/ast/v0.8.44/e011bb38d69ce6ca916bef32ca23a596e111394a4a69d0bac01f6d4422e692e1.json
  - graphify-out/cache/semantic/1564278f786f145208f4418becb5e087e9c305f6925bee8db1e556b78f4258d0.json
  - graphify-out/cache/semantic/d66cc6e97d687710eeaa911c471df04f217036251d48120dbd18961e72bf7121.json
  - graphify-out/cache/semantic/4fc46ba057e42a58981e3b5845c2d8974228c4ae2736e4b2273b943337e46c92.json
  - graphify-out/cache/semantic/df15782a31b1a17a4ec6de7d1336652c180835fab3f5904ae60bdb1a5698dd7a.json
  - graphify-out/cache/semantic/ec69655b3b3b01c696ea4696bbfd9d4455410a5e8e60217552a1039609ea6c3c.json
  - tasks/borisChernyClaudeMd.md
  - graphify-out/cache/semantic/04711698dd67d226450aff32ebbcb0d03280f19df052922e269f5bd6558f745a.json
  - graphify-out/cache/semantic/c818f33f9faa844e783d03754b9220ca81330a51e7cff8a3d4750eef9960af37.json
  - graphify-out/cache/semantic/c19b330cf7eda3314f82d2e3995955a9f97661895cff654c343cb02d4eff8294.json
  - graphify-out/cache/semantic/53f5c9056957bfdfc52b7d5187cc54af36864996abe4d38b2a70f53995c4ab90.json
  - graphify-out/cache/semantic/31681bb6a086dc2cb06da8c2e69c6d452499902a73073df8dd4d978975d4faa2.json
  - graphify-out/cache/semantic/eb5298226491b7442598f9532f7e9f8d95a3e6ffa1444e6db4fca41bc697d806.json
  - graphify-out/cache/semantic/ac382c6bd763edf573332f6b3aec6aaf9e01f35968babe9069414adebc1c7a13.json
  - graphify-out/cache/semantic/69d13ca8396d00817412c2c7e6711bf820df603c09ee2678464796c4e5fd6515.json
  - graphify-out/cache/semantic/fca81a20b67bc38d9cb8e07ced890d85d4e24c885e26fe561e779d14233d82dc.json
  - graphify-out/cache/semantic/5176ad8f26bf991a7c0e10f56b20305115ecf74fb1520b25a4232d5838d6f2d2.json
  - graphify-out/GRAPH_REPORT.md
  - graphify-out/cache/semantic/1f458a9dac9a1bacbfa28306be5ba67e8a42f3edd48f4d609ad11ce5f3fe9847.json
  - graphify-out/cache/semantic/de4e06f586c9cf9b2b3cd358c26b7bebdb9454198fd28e3b95873969427a50e5.json
  - graphify-out/cache/semantic/75502fb7cc6f0cb7677ad72e6adffa007d7520d315fc2576e88c5ae741d03d41.json
  - graphify-out/cache/semantic/ea8ee411b24a1286d1ad1b24a8948c695952668ad602bfe7378946a724a75f8c.json
  - graphify-out/cache/ast/v0.8.44/b604d3648f723b98f741bf48633af4bc73344e137fd8f08a75f0cd81f49e58fa.json
  - graphify-out/cache/ast/v0.8.44/f48dbf5cad37229732280de2fda8eae627b2aa5efcb41f24986c323a3c5f9365.json
  - graphify-out/cache/semantic/3930ce8cdef5dbbf2a09d93923542a9911b9cc31aa80defa00393a634d265d08.json
  - graphify-out/cache/semantic/55a2d2362807d714499f4a2731e47a668fe5d867b8074af3a56ada31b5677943.json
  - graphify-out/cache/semantic/5b7b5a7fed6b6830355510472a9d03b7e549a1ffa65ec815905fee3d2baf2a3b.json
  - graphify-out/cache/ast/v0.8.44/4c09477cadc21a4125c7c57a2434a8696b1fee71f23dd172ecd7ea200955dd99.json
  - graphify-out/cache/semantic/60e15b393d612db5336a22d4e6adbb3c6c51fa07dbf16cc01a794bc436a62861.json
  - graphify-out/cache/ast/v0.8.44/386401368c66971a3f07a3f56ce8ab9e9153901112b190a4fcf2051c46bdc075.json
  - graphify-out/cache/semantic/7a25d0e1e941fd88d83e5880cd325a48a732ca2640952633f93bc344a0828999.json
  - graphify-out/cache/semantic/83afb8f39e9f95c5645049720d7b497b21920a23ac1ab11512676952326f5299.json
  - graphify-out/cache/semantic/a0ebeb44f7244d90ac5d612fd8e12a240d649ef3c382dbed0fb025b237089985.json
  - graphify-out/graph.html
  - graphify-out/cache/semantic/ed70251e58da3816c8644df29b2b5211e6d74ce7dd816a8654061746ede7e088.json
  - graphify-out/cache/semantic/af0dd5d8d360c157a22c28e89f7697ec95ac0fe4d490e56d1494a904175328e1.json
  - graphify-out/cache/stat-index.json
  - graphify-out/cache/semantic/418ba54c8dcecb21bb27ae58b81e1ab8c98cf655be66267abe1a777858852cf2.json
  - graphify-out/cache/ast/v0.8.44/4ddf5e9458a8a22b201cb0a90a5770643b7d39577622a5b279934c859ce3aef2.json
  - graphify-out/cache/semantic/764b7b7b7656f817e99db4289295b968b5e4a0aa0ba032eaddc6876c21e84634.json
  - graphify-out/cache/semantic/f8e1222dff223e7119d52904f365a2458761491296730d73111d756418063a03.json
  - graphify-out/cache/semantic/e8f9cad313f2fb81dc8f5c5a42955feb9069c4486403d3b8fc01a1b44f02c407.json
  - graphify-out/cache/semantic/46f2b5ebd08d708504f4259f39868ddfdf15109366acaa4069b47f5fa3d01acc.json
  - graphify-out/cache/semantic/03eaf00cbe965e62ceffcc98127b2c4075b9e6c737ed54e1eea3ea6bd8caaefc.json
  - graphify-out/cache/semantic/d549692471c10078e73a087548268c9298907c60873fe991c04136fba1624c7b.json
  - graphify-out/.graphify_python
  - graphify-out/cache/semantic/1d06a280f0b5d6431aad69f6d259cd93941119675d2fde409f12e45afd0e634b.json
  - graphify-out/cache/semantic/37eb647b8cef4372462e4faf10b53e055f762b754de2a289b2b06f1275f08873.json
  - graphify-out/cache/ast/v0.8.44/42cf34065153763fb0663ed89879c6e50fcdb7753b6397b6a33d38518c3aea3c.json
  - graphify-out/cache/semantic/8515b018028115764b5136669a62294b4b3c33e5f9357488f180d4fb5c6e5e10.json
  - graphify-out/cache/semantic/54ab38ac49296b3d3db44b9c9155a66ad0a7618961ff3e177fb4f559afa4ffe1.json
  - graphify-out/cache/semantic/a2b958060ec2d3b4508d31d6971d50d0e6a64844c1e7c0c01b083d33489d3c0d.json
  - graphify-out/cache/semantic/f9ff791c6c95d9dace67f1dd389321f368be5e4f837d02d9b75cda2c9be5dd94.json
  - graphify-out/cache/semantic/3025b0a360bd70abc9dff168bf1d371298a81728f306e0e32e87c1c700b7efb4.json
  - graphify-out/cache/semantic/a6374249375dd8a9efff3bd1f6a04d4ca0eb9a70299b6606577ef6065af1f084.json
  - graphify-out/cache/semantic/6fb4fba0c01239bb87d523d630b860ba4f4bfe6582b17d584cc4399ae063b101.json
  - graphify-out/cache/semantic/a4465690110f5ae8122d600b92075817e1440fcf046d2c5e6b8d296ca847b67b.json
  - graphify-out/cache/semantic/daf278620d4dce79dde6a74e52afdbe79337e5a39a52b471466b465e31577c09.json
  - graphify-out/cache/semantic/81f4c75b353262641a5e34172c5958cebdd59e607b813c9fb4bd76ae84b9b7ea.json
  - graphify-out/cache/ast/v0.8.44/d6df45b4de58cef579af121ff7f7566b0ba52fd06a19a5cb430d5cbae3ce4d6f.json
  - graphify-out/cache/semantic/d91c8c175fca7bd335cb800646b1a492e4a662f79390efc2a33bef2cc9e19e1d.json
  - graphify-out/cache/semantic/26ce1273ad133a0943228a5f07176c95ed385bb450fdcf635c9629eb11621a84.json
  - graphify-out/cache/semantic/2a8876b5505120f3fe877e9533e2214b87c3433eb97e9f0388b8fb5cc8f32866.json
  - graphify-out/cache/semantic/5ee64324ff95f7839fb497b56695cf288bea332857b56986fe405268b6803d66.json
  - graphify-out/cache/semantic/d120bbd6b8d2ee7db78c923dd58afaff727f0262ca47e6660adde5037d2f61c4.json
  - graphify-out/cache/semantic/5756b578c1afc6e11f3fde8c1ed6d68c8c903b5508dc9500c5e1f5135a9a0a0b.json
  - graphify-out/cache/semantic/b66d270a3455b7bc99742d45ff12c848546009e7fbb74e6a8de39b732501ee96.json
  - graphify-out/cache/semantic/6925e2c9eb7efa0e29184bc0d02eaaa250dfc98fccf8d8cd4cf68ca21fbcd5d5.json
  - graphify-out/cache/semantic/be648dbaee8066094a541dacb6060328b8a395264776b75545240716c70c2c54.json
  - graphify-out/cache/semantic/61460724ea9d23dc20c656a37426157b0e519f47dd45e82d254d1113912fb117.json
  - graphify-out/cache/semantic/5d6b8379ba1c8eb39bc57ea5450eb2162bb7e3806798c49b6ba58b28235b744d.json
  - graphify-out/cache/semantic/9c63cd450cdf464ef8e8fd3002d62dda77d8d0950fbcbca13a53fa3735670d98.json
  - graphify-out/cache/semantic/1702c55b9f7996536329d87c20db315b2aa0537fd4bcdb916fd329cf221f152c.json
  - graphify-out/cache/semantic/c0558d27b20437347205804cb156633e5e4318491bbbed2184098d8bd82cf857.json
  - graphify-out/cache/semantic/c3a4b0bb1b96432b0d26e46a5200399619a1f0af8ab7e2fc973c25811223beb8.json
  - graphify-out/cache/semantic/d1f2194401dbb84e56c98a0d166ee228a61e1175ac3d0b8b513f4cf7399a9ea4.json
  - graphify-out/cache/semantic/f4a12812264edfe4063c229a68b86f446f154f6f29439337006c756f9dc82e09.json
  - graphify-out/cache/semantic/dd2711dd2c80914697cdee0a471a409e096e25ebf9e298d7884ffdedc51c4c60.json
  - graphify-out/cache/ast/v0.8.44/574a84a9392c4f7ba5faf7475dd2c1d7b47c5476408d1bce4faba800bc0a9a4a.json
  - graphify-out/cache/semantic/75e5a0f05909f655e6a1f7927048d5903731c8755a6ac6896088eee442e6042e.json
  - graphify-out/cache/semantic/0f14e768c70859ccdc771b8faa81a78f97d20ef64f028b072a6bcd6b62ea13d4.json
  - graphify-out/cache/semantic/be8ae53a6205061665afe5fef67c7b9f64241ef737c45035709b2bc912c0df69.json
  - graphify-out/cache/semantic/4789a8b4cf6e254a9bcc95b905f26917ea83cca88926cc6bde195071a6a99a63.json
  - graphify-out/cache/semantic/474baa2bcd237c68c96539c6f68e8b7a461198d9560632c9fce4c1c39819c926.json
  - graphify-out/cache/semantic/c989cd2911893853a4941e7d5eb1ca7a33ca87f50ef0432adcb463b7395b399f.json
  - graphify-out/cache/semantic/4a50fd8270b73057457032bc7ffb79fbbce30e0f36b96c1ee7f133dc816e81a7.json
  - graphify-out/cache/semantic/541e16aa32fc813d570f5b7f8be9a7970424c341c08ac414d96dc53421c69116.json
  - graphify-out/cache/semantic/3b233a6754cae6a7ec00c998eb21db4e5869c5ec5875f891ce89a03cec9cf58f.json
  - graphify-out/cache/semantic/02bfe00789d054a7c76f739fc6c398adedb8e1dbbf9722b281f6d92bf83a0271.json
  - graphify-out/cache/semantic/ae698ef095bfc85aafac8e304f12e477c267a32199fd6cd7a102fcd5113c9e2b.json
  - graphify-out/cache/semantic/9f10a77fb1d452119cee51a37c77e354e394ce2fbbde2af3dde534f019c0e339.json
  - graphify-out/cache/semantic/9a6a4c4b2ba07576235e946bb844fa5b06717fa6381da99e8fcef09959133ed7.json
  - graphify-out/cache/ast/v0.8.44/4c0d430e23e0a32d12234431b56a6b60af0ea7c7fb0f22ed31ed98b32453f006.json
  - graphify-out/cache/semantic/f5ca7834d7834443da40eb6aef590d58330024f930811f7a25300d004318a045.json
  - graphify-out/.graphify_root
  - graphify-out/cache/semantic/00840100e466a34f28d4590d8b5599e58ecb9abee7391661aeb1ef8d3395f971.json
  - graphify-out/cache/semantic/7589e46f60fc63aba488bb0cfc79a4141081c542ee24b779fb3aea03be915672.json
  - graphify-out/cache/semantic/9fc88904143587a712371d495e0baa42f5b1198b9d0203e7e70200cca5068520.json
  - graphify-out/cache/semantic/bc3763d64d10d52cfa9494181eaa5c0f3c83677582c34ab403fb0d0a03b0b3e8.json
  - graphify-out/cache/semantic/b49db37e0cfbd723612f081dc5c08247c8b0f09c8b3c9b54ed329b9936947549.json
  - graphify-out/cache/semantic/82d5f0c6ae9106955bb06e634959b449b88ef946632cd422fca2b774d162a0ab.json
  - graphify-out/cache/semantic/c8095da5318802edff81d93935072ba324aee73b6a95ecddc0875a6504058560.json
  - graphify-out/cache/semantic/dbbe74f34f30470277fbe432f4b3e751f22f4760c3db01619adbad3f9043ba76.json
  - graphify-out/cache/ast/v0.8.44/d8003394aa45c3820bd613b17355e0e97b5267f821949a3bce464129cfa19158.json
  - graphify-out/cache/semantic/c7847137a048d9bdc3be7a2454190d30a1ce34963b27703ebfe3db2aef6436ee.json
  - graphify-out/cache/semantic/ab003bd3904987bac1962a597b922b0d3ac10e05823a6e285f0e65c15ac5f308.json
  - graphify-out/cache/semantic/d5c563bd888151e85553cb3f1153d6a8b62de905674e3a831169488d76172cea.json
  - graphify-out/cache/ast/v0.8.44/ff7bb897cccbbf5a2d4fcac2c213a9438078ac2df0fb3069a1f15fa88912ca47.json
  - graphify-out/cache/semantic/87ce33d2f7eff5da8b80b13d868bc00a1a5acbb776d5a8fee607abec9ab2e574.json
  - graphify-out/cache/semantic/f7dd8aa42cca86a382392629232ffbfa27ceae5ac4c42de704fbbf88b70de328.json
  - graphify-out/cache/ast/v0.8.44/40ee6cb0a8e93cbd0e7c5bd318e52dd3612b55b848b72b8b8d72c2dac71f3372.json
  - graphify-out/cache/semantic/c3414687ca9085d30bc796743322363bb5513370abd08625f910a9639cd8cbf6.json
  - graphify-out/cache/semantic/aed2536aa56856ebcb5610c6c364cac37543bcab09234ad89716e7a1f62cef46.json
  - graphify-out/cache/semantic/247820da0d7d6fd13800421af373a0051f1b521ec1a9fe8335aeb30a4a8e1c28.json
  - graphify-out/cache/ast/v0.8.44/4cbcd914a9bb5d5b6be63fcba8aa1457ebf94009d55941c038bc072de375cb28.json
  - graphify-out/cache/ast/v0.8.44/1a786b9bb2244dd4f1b26e79bb246848b38636d8fd314425571555f4cda91a87.json
  - graphify-out/cache/semantic/4f24acc4f4d5af198fc81a0dbc4733eec52544c405014dd46d2e0f5c9d4c3d35.json
  - graphify-out/cache/semantic/540e1759cf0c1e149d246eba0ad69767f686b31103fe1835682fc0de4bb2e566.json
  - graphify-out/cache/semantic/955780e0901822aec0e4050ebf07de2591dc412e4ab002882599f0a5200243b4.json
  - graphify-out/cache/semantic/f05794463e030a9105ec4c529341bccdca5ca2f1abe61576822dd572d9659370.json
  - graphify-out/manifest.json
  - graphify-out/cache/semantic/3f720e7a0c4ce9caabcf02bfabd5914f765f216e40473d539ed43c42039c9aed.json
  - graphify-out/cache/semantic/2dc3d5c57a5d1b9b7824ea72fea16a68cbbd28b228f9c27bccbf620cf66e2167.json
  - graphify-out/cache/semantic/fd9c53ae1e751e2ae2260fa07ee2be45e6cbf9237cf2f3b6b3dcededc102f315.json
  - graphify-out/cache/semantic/b7f587b2470ba2c4bcde54aa271fef31b971c9f38ffe042653e0a012298e90b5.json
  - graphify-out/cache/semantic/fd59ec92a6cccb9090d6b1e1f31d724cc3dc7324d1af5a83a36fe9303a2fd813.json
  - graphify-out/cache/semantic/62553e59426aedfa0e45bfd9efd1a08a6864607d01d6d414646ca26bfc26004d.json
  - graphify-out/cache/semantic/fed7ca43d67afc83f5c49765461f5028ab8ac6cf8d0f274497200be60a74a894.json
  - graphify-out/cache/semantic/167919c3766baabe568b03d75c9a9983154aeaa8513b9606fbbe035b8ecc5504.json
  - graphify-out/cache/semantic/953298b01ebb47f4f0ac33ec322570c8a1f0f71c54751d6e764cb3ee8fac5b82.json
  - graphify-out/cache/semantic/b33c9c10f2abdfd280a1286796f706ca01930aeb2cb3f1e34e6857b716f89c8c.json
  - graphify-out/cache/semantic/60447ca4eb9241f515f5567d5465d99f8abdf76ead0faf8a8ff83ff1a020d1d5.json
-->

---
### Requirement: Scoring rubric uses 12-point scale aligned to required sections

The pattern library scoring rubric SHALL:
- Score exactly 6 rows × 2 points each = 12 points maximum
- Not include a "Tool Permissions" row
- Not include a "Sub-agent Contracts" row
- Include a "Commands" row
- Rename "Behavior rules" row to "Hard rules"
- Define score thresholds: 0–3 = Major gaps (generate new), 4–7 = Moderate gaps (additions), 8–10 = Good (minor refinements), 11–12 = Excellent (no action)

#### Scenario: Rubric max score is 12

- **WHEN** an advisor reads the Scoring Rubric section
- **THEN** the stated maximum score is 12 (not 16)
- **THEN** exactly 6 rows appear in the rubric table

#### Scenario: Rubric includes Commands row

- **WHEN** an advisor reads the Scoring Rubric
- **THEN** a row for "Commands" exists with scoring criteria

<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
-->


<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - graphify-out/cache/semantic/c4cef9b68f5d53ba3b0268a466f90deabffe74154321145184b3b2c92e746c47.json
  - graphify-out/cache/semantic/15c28e7fc33562bf54735dc883e1b5556988ee081fbd3fad807dcd31c0751ec1.json
  - graphify-out/cache/semantic/78518ab7963f8511fc607597b22dae8ebb564602434ca1fc7ffd78ee0fe3a01d.json
  - graphify-out/cache/semantic/2fa27eda4acec43176597698e8553329e00337605047a0d65c1dc5157eea1528.json
  - graphify-out/cache/semantic/7df3d22a3e9933b090589d51ffd2dcdac7442cab01624370288c9ae1148484df.json
  - graphify-out/cache/semantic/c63a18be7c1092b5324a482f233dd8dc17de7af28cab99175d16a92dc6af697b.json
  - graphify-out/cache/semantic/c7c895c90d89e9cd9b4e3950590a81c04e83b4d1fff8e0b4985435060d8e2eb9.json
  - graphify-out/cache/semantic/d6d037cc5fbc7f991cb8b3f41afd2685e8d32201496ee70b13055178e770a907.json
  - graphify-out/cost.json
  - graphify-out/cache/semantic/52de177e49e90a8849d74fcb83feafbe2e4ec428844bfa6bc4227fde909b9042.json
  - graphify-out/cache/semantic/e055b4f794da960d908bea90943d253190690f94af54e90a3eb6a029e5aea58e.json
  - graphify-out/cache/semantic/7c3f4d5c900b4f4774dac25cab0e2193d78a9d8f992d110196364b40457397cf.json
  - graphify-out/cache/semantic/48cbc27761ac6c919aeffa938d8e1129f86a04c26a53a954378922df698a63ce.json
  - .spectra/changes/align-claudemd-patterns-with-canonical-template.started
  - graphify-out/cache/semantic/daa73c5435f7b5ad6f4a04c8cfbc3da2d6a2ce62eb3ff576aff66335c99a7457.json
  - graphify-out/cache/semantic/e4f4acbb4beeddb600a3af72243316e83b9cf9dfd1be35af32e8ec3dfc13bcc6.json
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
  - graphify-out/cache/semantic/9e7decb73db7ffe161d67b92498a21e9a394034ddf08c19755b7d05ec7731735.json
  - graphify-out/cache/semantic/4024cd44fe7eb512c253fc8c63e96a4c8347e1757f72221d9c6ba6ee0c114bfa.json
  - graphify-out/cache/semantic/1f81019a83c967ad2bff838f8db3a62e608bf48a1f0debe5620bd6affe1676fc.json
  - graphify-out/cache/semantic/dc4407acf80a2367a6be36386c0a9adf2747203d1ea70b44f00e365fb3580161.json
  - graphify-out/cache/semantic/82adcadd1a8760e736381f7a49c9f0388698463e0247a704b3255e298da07212.json
  - graphify-out/cache/semantic/2e4339fde919b35034bfbdc20fb389ab84c2dafb0903e02d667cca34cf3c897e.json
  - graphify-out/cache/semantic/dd0ec26f34c083ae04cfb9ad4a2adfa0211411e59561f734f6d4bfb27bb3ffcb.json
  - graphify-out/cache/semantic/e3fc9770dd41d6f2644a6639301106aa884224d2a6b229592d6368e30d0e6d98.json
  - graphify-out/cache/semantic/c11e49d44a30451e73022776ec8bf6611ce281ee1558dca047bfcf3711c179c3.json
  - graphify-out/cache/semantic/13ac9d0b782317033702a3f801ca5451018892a6a8699788b604b9777b447291.json
  - graphify-out/cache/semantic/bb57a7f92284356a308ce79bfb412ceaa58c07712d6902d4f672efe5d614fa2b.json
  - graphify-out/cache/semantic/35e96865a88747101f22c03654755f935a1d83a69cc0b44c8d50b03e7d9e9086.json
  - graphify-out/.graphify_labels.json
  - graphify-out/cache/semantic/7f1b10bc66d9b86304c6a7759eab4e5296fb495fdf7fd1710cee02705f6d48da.json
  - graphify-out/cache/semantic/bd8628dac7e60e3f2349146f4c1afc12cb217fbb20cc93aa4bb946cb66cdb833.json
  - graphify-out/cache/semantic/485812515c1974342c86c214b769195c6be6a2ca4250f3ccbec8cb4ce8d91007.json
  - graphify-out/cache/semantic/be8a5fb5fa02ce9d4a7179cafb3aee29f7249c0e438b362ccae8110d3a3b9272.json
  - graphify-out/cache/semantic/e18a9fc4cf081e1d4a10f5a82f97a1121819c544ce0e4129347b3e03a5172005.json
  - graphify-out/cache/semantic/286ef28cf6d6f2f33e272b4fe0fba67e71f1d7717093eab6e27588c3d3f5a4ff.json
  - graphify-out/cache/semantic/13b6b88f2a7837fab8e96a50cbb227977056f928248f73f3226ae1d8477eb659.json
  - graphify-out/graph.json
  - graphify-out/cache/semantic/3215f3dc0a999839c33faf1083b8a42be23ffca4922077749ae511cd60ed4dac.json
  - graphify-out/cache/semantic/404e3194ef9150686ce079cc651fc37fe4fc76ad7c450ba3d0c3c3041e2714f4.json
  - graphify-out/cache/semantic/bf9dffdaf41d9f55c80a5fbbc8ecf36afb4e0662f13e71d204d471404f46e64c.json
  - graphify-out/cache/semantic/9d3548f299f2196d47bae975d57ffb5ab44924a1c848f32f479be269b7661d4c.json
  - graphify-out/cache/semantic/8499901ca09af81499ec7a32b524ef190776b34b11cd4d0596960e025f12657f.json
  - graphify-out/cache/semantic/f7f3020cb12a9191ae6f1b5c2f9d6b3a0487c82a4395d97696470514e1a4c06b.json
  - graphify-out/cache/semantic/3255d8ab6709240ca1afb52b90a2fe6c7f167ca095b21f3178b742835cbd43d2.json
  - graphify-out/cache/semantic/b78cd456c3da6afeda800a2b76a55fc339266beb28f04e9d4fc796879cc4788b.json
  - graphify-out/cache/semantic/241717c78c067f69d5acc2a7de091374647ac49336ac243f68225b911dfdb8e4.json
  - graphify-out/cache/semantic/d8be7b99474994cd01a3b7b596c2626592bfc8d42c883ce6d482e21b8ac1611a.json
  - graphify-out/cache/semantic/a65abc71a5912237bd19f84197c462293b1d92a6024db89fab88bb8805d321f0.json
  - graphify-out/cache/semantic/c42fd4d8c851e352ed8de27ccdc82d050b437c7b1c31703235c84d971a6ca5a8.json
  - graphify-out/cache/semantic/b450a2671cd153f5f2d00793595fa0c1461792d63c5d5afd51da7c92659f2509.json
  - graphify-out/cache/semantic/ca72404d5d8b8c1a042dbfa4fb6eefedb7a10b8e0a86d60429dd975fa244ee98.json
  - graphify-out/cache/ast/v0.8.44/e011bb38d69ce6ca916bef32ca23a596e111394a4a69d0bac01f6d4422e692e1.json
  - graphify-out/cache/semantic/1564278f786f145208f4418becb5e087e9c305f6925bee8db1e556b78f4258d0.json
  - graphify-out/cache/semantic/d66cc6e97d687710eeaa911c471df04f217036251d48120dbd18961e72bf7121.json
  - graphify-out/cache/semantic/4fc46ba057e42a58981e3b5845c2d8974228c4ae2736e4b2273b943337e46c92.json
  - graphify-out/cache/semantic/df15782a31b1a17a4ec6de7d1336652c180835fab3f5904ae60bdb1a5698dd7a.json
  - graphify-out/cache/semantic/ec69655b3b3b01c696ea4696bbfd9d4455410a5e8e60217552a1039609ea6c3c.json
  - tasks/borisChernyClaudeMd.md
  - graphify-out/cache/semantic/04711698dd67d226450aff32ebbcb0d03280f19df052922e269f5bd6558f745a.json
  - graphify-out/cache/semantic/c818f33f9faa844e783d03754b9220ca81330a51e7cff8a3d4750eef9960af37.json
  - graphify-out/cache/semantic/c19b330cf7eda3314f82d2e3995955a9f97661895cff654c343cb02d4eff8294.json
  - graphify-out/cache/semantic/53f5c9056957bfdfc52b7d5187cc54af36864996abe4d38b2a70f53995c4ab90.json
  - graphify-out/cache/semantic/31681bb6a086dc2cb06da8c2e69c6d452499902a73073df8dd4d978975d4faa2.json
  - graphify-out/cache/semantic/eb5298226491b7442598f9532f7e9f8d95a3e6ffa1444e6db4fca41bc697d806.json
  - graphify-out/cache/semantic/ac382c6bd763edf573332f6b3aec6aaf9e01f35968babe9069414adebc1c7a13.json
  - graphify-out/cache/semantic/69d13ca8396d00817412c2c7e6711bf820df603c09ee2678464796c4e5fd6515.json
  - graphify-out/cache/semantic/fca81a20b67bc38d9cb8e07ced890d85d4e24c885e26fe561e779d14233d82dc.json
  - graphify-out/cache/semantic/5176ad8f26bf991a7c0e10f56b20305115ecf74fb1520b25a4232d5838d6f2d2.json
  - graphify-out/GRAPH_REPORT.md
  - graphify-out/cache/semantic/1f458a9dac9a1bacbfa28306be5ba67e8a42f3edd48f4d609ad11ce5f3fe9847.json
  - graphify-out/cache/semantic/de4e06f586c9cf9b2b3cd358c26b7bebdb9454198fd28e3b95873969427a50e5.json
  - graphify-out/cache/semantic/75502fb7cc6f0cb7677ad72e6adffa007d7520d315fc2576e88c5ae741d03d41.json
  - graphify-out/cache/semantic/ea8ee411b24a1286d1ad1b24a8948c695952668ad602bfe7378946a724a75f8c.json
  - graphify-out/cache/ast/v0.8.44/b604d3648f723b98f741bf48633af4bc73344e137fd8f08a75f0cd81f49e58fa.json
  - graphify-out/cache/ast/v0.8.44/f48dbf5cad37229732280de2fda8eae627b2aa5efcb41f24986c323a3c5f9365.json
  - graphify-out/cache/semantic/3930ce8cdef5dbbf2a09d93923542a9911b9cc31aa80defa00393a634d265d08.json
  - graphify-out/cache/semantic/55a2d2362807d714499f4a2731e47a668fe5d867b8074af3a56ada31b5677943.json
  - graphify-out/cache/semantic/5b7b5a7fed6b6830355510472a9d03b7e549a1ffa65ec815905fee3d2baf2a3b.json
  - graphify-out/cache/ast/v0.8.44/4c09477cadc21a4125c7c57a2434a8696b1fee71f23dd172ecd7ea200955dd99.json
  - graphify-out/cache/semantic/60e15b393d612db5336a22d4e6adbb3c6c51fa07dbf16cc01a794bc436a62861.json
  - graphify-out/cache/ast/v0.8.44/386401368c66971a3f07a3f56ce8ab9e9153901112b190a4fcf2051c46bdc075.json
  - graphify-out/cache/semantic/7a25d0e1e941fd88d83e5880cd325a48a732ca2640952633f93bc344a0828999.json
  - graphify-out/cache/semantic/83afb8f39e9f95c5645049720d7b497b21920a23ac1ab11512676952326f5299.json
  - graphify-out/cache/semantic/a0ebeb44f7244d90ac5d612fd8e12a240d649ef3c382dbed0fb025b237089985.json
  - graphify-out/graph.html
  - graphify-out/cache/semantic/ed70251e58da3816c8644df29b2b5211e6d74ce7dd816a8654061746ede7e088.json
  - graphify-out/cache/semantic/af0dd5d8d360c157a22c28e89f7697ec95ac0fe4d490e56d1494a904175328e1.json
  - graphify-out/cache/stat-index.json
  - graphify-out/cache/semantic/418ba54c8dcecb21bb27ae58b81e1ab8c98cf655be66267abe1a777858852cf2.json
  - graphify-out/cache/ast/v0.8.44/4ddf5e9458a8a22b201cb0a90a5770643b7d39577622a5b279934c859ce3aef2.json
  - graphify-out/cache/semantic/764b7b7b7656f817e99db4289295b968b5e4a0aa0ba032eaddc6876c21e84634.json
  - graphify-out/cache/semantic/f8e1222dff223e7119d52904f365a2458761491296730d73111d756418063a03.json
  - graphify-out/cache/semantic/e8f9cad313f2fb81dc8f5c5a42955feb9069c4486403d3b8fc01a1b44f02c407.json
  - graphify-out/cache/semantic/46f2b5ebd08d708504f4259f39868ddfdf15109366acaa4069b47f5fa3d01acc.json
  - graphify-out/cache/semantic/03eaf00cbe965e62ceffcc98127b2c4075b9e6c737ed54e1eea3ea6bd8caaefc.json
  - graphify-out/cache/semantic/d549692471c10078e73a087548268c9298907c60873fe991c04136fba1624c7b.json
  - graphify-out/.graphify_python
  - graphify-out/cache/semantic/1d06a280f0b5d6431aad69f6d259cd93941119675d2fde409f12e45afd0e634b.json
  - graphify-out/cache/semantic/37eb647b8cef4372462e4faf10b53e055f762b754de2a289b2b06f1275f08873.json
  - graphify-out/cache/ast/v0.8.44/42cf34065153763fb0663ed89879c6e50fcdb7753b6397b6a33d38518c3aea3c.json
  - graphify-out/cache/semantic/8515b018028115764b5136669a62294b4b3c33e5f9357488f180d4fb5c6e5e10.json
  - graphify-out/cache/semantic/54ab38ac49296b3d3db44b9c9155a66ad0a7618961ff3e177fb4f559afa4ffe1.json
  - graphify-out/cache/semantic/a2b958060ec2d3b4508d31d6971d50d0e6a64844c1e7c0c01b083d33489d3c0d.json
  - graphify-out/cache/semantic/f9ff791c6c95d9dace67f1dd389321f368be5e4f837d02d9b75cda2c9be5dd94.json
  - graphify-out/cache/semantic/3025b0a360bd70abc9dff168bf1d371298a81728f306e0e32e87c1c700b7efb4.json
  - graphify-out/cache/semantic/a6374249375dd8a9efff3bd1f6a04d4ca0eb9a70299b6606577ef6065af1f084.json
  - graphify-out/cache/semantic/6fb4fba0c01239bb87d523d630b860ba4f4bfe6582b17d584cc4399ae063b101.json
  - graphify-out/cache/semantic/a4465690110f5ae8122d600b92075817e1440fcf046d2c5e6b8d296ca847b67b.json
  - graphify-out/cache/semantic/daf278620d4dce79dde6a74e52afdbe79337e5a39a52b471466b465e31577c09.json
  - graphify-out/cache/semantic/81f4c75b353262641a5e34172c5958cebdd59e607b813c9fb4bd76ae84b9b7ea.json
  - graphify-out/cache/ast/v0.8.44/d6df45b4de58cef579af121ff7f7566b0ba52fd06a19a5cb430d5cbae3ce4d6f.json
  - graphify-out/cache/semantic/d91c8c175fca7bd335cb800646b1a492e4a662f79390efc2a33bef2cc9e19e1d.json
  - graphify-out/cache/semantic/26ce1273ad133a0943228a5f07176c95ed385bb450fdcf635c9629eb11621a84.json
  - graphify-out/cache/semantic/2a8876b5505120f3fe877e9533e2214b87c3433eb97e9f0388b8fb5cc8f32866.json
  - graphify-out/cache/semantic/5ee64324ff95f7839fb497b56695cf288bea332857b56986fe405268b6803d66.json
  - graphify-out/cache/semantic/d120bbd6b8d2ee7db78c923dd58afaff727f0262ca47e6660adde5037d2f61c4.json
  - graphify-out/cache/semantic/5756b578c1afc6e11f3fde8c1ed6d68c8c903b5508dc9500c5e1f5135a9a0a0b.json
  - graphify-out/cache/semantic/b66d270a3455b7bc99742d45ff12c848546009e7fbb74e6a8de39b732501ee96.json
  - graphify-out/cache/semantic/6925e2c9eb7efa0e29184bc0d02eaaa250dfc98fccf8d8cd4cf68ca21fbcd5d5.json
  - graphify-out/cache/semantic/be648dbaee8066094a541dacb6060328b8a395264776b75545240716c70c2c54.json
  - graphify-out/cache/semantic/61460724ea9d23dc20c656a37426157b0e519f47dd45e82d254d1113912fb117.json
  - graphify-out/cache/semantic/5d6b8379ba1c8eb39bc57ea5450eb2162bb7e3806798c49b6ba58b28235b744d.json
  - graphify-out/cache/semantic/9c63cd450cdf464ef8e8fd3002d62dda77d8d0950fbcbca13a53fa3735670d98.json
  - graphify-out/cache/semantic/1702c55b9f7996536329d87c20db315b2aa0537fd4bcdb916fd329cf221f152c.json
  - graphify-out/cache/semantic/c0558d27b20437347205804cb156633e5e4318491bbbed2184098d8bd82cf857.json
  - graphify-out/cache/semantic/c3a4b0bb1b96432b0d26e46a5200399619a1f0af8ab7e2fc973c25811223beb8.json
  - graphify-out/cache/semantic/d1f2194401dbb84e56c98a0d166ee228a61e1175ac3d0b8b513f4cf7399a9ea4.json
  - graphify-out/cache/semantic/f4a12812264edfe4063c229a68b86f446f154f6f29439337006c756f9dc82e09.json
  - graphify-out/cache/semantic/dd2711dd2c80914697cdee0a471a409e096e25ebf9e298d7884ffdedc51c4c60.json
  - graphify-out/cache/ast/v0.8.44/574a84a9392c4f7ba5faf7475dd2c1d7b47c5476408d1bce4faba800bc0a9a4a.json
  - graphify-out/cache/semantic/75e5a0f05909f655e6a1f7927048d5903731c8755a6ac6896088eee442e6042e.json
  - graphify-out/cache/semantic/0f14e768c70859ccdc771b8faa81a78f97d20ef64f028b072a6bcd6b62ea13d4.json
  - graphify-out/cache/semantic/be8ae53a6205061665afe5fef67c7b9f64241ef737c45035709b2bc912c0df69.json
  - graphify-out/cache/semantic/4789a8b4cf6e254a9bcc95b905f26917ea83cca88926cc6bde195071a6a99a63.json
  - graphify-out/cache/semantic/474baa2bcd237c68c96539c6f68e8b7a461198d9560632c9fce4c1c39819c926.json
  - graphify-out/cache/semantic/c989cd2911893853a4941e7d5eb1ca7a33ca87f50ef0432adcb463b7395b399f.json
  - graphify-out/cache/semantic/4a50fd8270b73057457032bc7ffb79fbbce30e0f36b96c1ee7f133dc816e81a7.json
  - graphify-out/cache/semantic/541e16aa32fc813d570f5b7f8be9a7970424c341c08ac414d96dc53421c69116.json
  - graphify-out/cache/semantic/3b233a6754cae6a7ec00c998eb21db4e5869c5ec5875f891ce89a03cec9cf58f.json
  - graphify-out/cache/semantic/02bfe00789d054a7c76f739fc6c398adedb8e1dbbf9722b281f6d92bf83a0271.json
  - graphify-out/cache/semantic/ae698ef095bfc85aafac8e304f12e477c267a32199fd6cd7a102fcd5113c9e2b.json
  - graphify-out/cache/semantic/9f10a77fb1d452119cee51a37c77e354e394ce2fbbde2af3dde534f019c0e339.json
  - graphify-out/cache/semantic/9a6a4c4b2ba07576235e946bb844fa5b06717fa6381da99e8fcef09959133ed7.json
  - graphify-out/cache/ast/v0.8.44/4c0d430e23e0a32d12234431b56a6b60af0ea7c7fb0f22ed31ed98b32453f006.json
  - graphify-out/cache/semantic/f5ca7834d7834443da40eb6aef590d58330024f930811f7a25300d004318a045.json
  - graphify-out/.graphify_root
  - graphify-out/cache/semantic/00840100e466a34f28d4590d8b5599e58ecb9abee7391661aeb1ef8d3395f971.json
  - graphify-out/cache/semantic/7589e46f60fc63aba488bb0cfc79a4141081c542ee24b779fb3aea03be915672.json
  - graphify-out/cache/semantic/9fc88904143587a712371d495e0baa42f5b1198b9d0203e7e70200cca5068520.json
  - graphify-out/cache/semantic/bc3763d64d10d52cfa9494181eaa5c0f3c83677582c34ab403fb0d0a03b0b3e8.json
  - graphify-out/cache/semantic/b49db37e0cfbd723612f081dc5c08247c8b0f09c8b3c9b54ed329b9936947549.json
  - graphify-out/cache/semantic/82d5f0c6ae9106955bb06e634959b449b88ef946632cd422fca2b774d162a0ab.json
  - graphify-out/cache/semantic/c8095da5318802edff81d93935072ba324aee73b6a95ecddc0875a6504058560.json
  - graphify-out/cache/semantic/dbbe74f34f30470277fbe432f4b3e751f22f4760c3db01619adbad3f9043ba76.json
  - graphify-out/cache/ast/v0.8.44/d8003394aa45c3820bd613b17355e0e97b5267f821949a3bce464129cfa19158.json
  - graphify-out/cache/semantic/c7847137a048d9bdc3be7a2454190d30a1ce34963b27703ebfe3db2aef6436ee.json
  - graphify-out/cache/semantic/ab003bd3904987bac1962a597b922b0d3ac10e05823a6e285f0e65c15ac5f308.json
  - graphify-out/cache/semantic/d5c563bd888151e85553cb3f1153d6a8b62de905674e3a831169488d76172cea.json
  - graphify-out/cache/ast/v0.8.44/ff7bb897cccbbf5a2d4fcac2c213a9438078ac2df0fb3069a1f15fa88912ca47.json
  - graphify-out/cache/semantic/87ce33d2f7eff5da8b80b13d868bc00a1a5acbb776d5a8fee607abec9ab2e574.json
  - graphify-out/cache/semantic/f7dd8aa42cca86a382392629232ffbfa27ceae5ac4c42de704fbbf88b70de328.json
  - graphify-out/cache/ast/v0.8.44/40ee6cb0a8e93cbd0e7c5bd318e52dd3612b55b848b72b8b8d72c2dac71f3372.json
  - graphify-out/cache/semantic/c3414687ca9085d30bc796743322363bb5513370abd08625f910a9639cd8cbf6.json
  - graphify-out/cache/semantic/aed2536aa56856ebcb5610c6c364cac37543bcab09234ad89716e7a1f62cef46.json
  - graphify-out/cache/semantic/247820da0d7d6fd13800421af373a0051f1b521ec1a9fe8335aeb30a4a8e1c28.json
  - graphify-out/cache/ast/v0.8.44/4cbcd914a9bb5d5b6be63fcba8aa1457ebf94009d55941c038bc072de375cb28.json
  - graphify-out/cache/ast/v0.8.44/1a786b9bb2244dd4f1b26e79bb246848b38636d8fd314425571555f4cda91a87.json
  - graphify-out/cache/semantic/4f24acc4f4d5af198fc81a0dbc4733eec52544c405014dd46d2e0f5c9d4c3d35.json
  - graphify-out/cache/semantic/540e1759cf0c1e149d246eba0ad69767f686b31103fe1835682fc0de4bb2e566.json
  - graphify-out/cache/semantic/955780e0901822aec0e4050ebf07de2591dc412e4ab002882599f0a5200243b4.json
  - graphify-out/cache/semantic/f05794463e030a9105ec4c529341bccdca5ca2f1abe61576822dd572d9659370.json
  - graphify-out/manifest.json
  - graphify-out/cache/semantic/3f720e7a0c4ce9caabcf02bfabd5914f765f216e40473d539ed43c42039c9aed.json
  - graphify-out/cache/semantic/2dc3d5c57a5d1b9b7824ea72fea16a68cbbd28b228f9c27bccbf620cf66e2167.json
  - graphify-out/cache/semantic/fd9c53ae1e751e2ae2260fa07ee2be45e6cbf9237cf2f3b6b3dcededc102f315.json
  - graphify-out/cache/semantic/b7f587b2470ba2c4bcde54aa271fef31b971c9f38ffe042653e0a012298e90b5.json
  - graphify-out/cache/semantic/fd59ec92a6cccb9090d6b1e1f31d724cc3dc7324d1af5a83a36fe9303a2fd813.json
  - graphify-out/cache/semantic/62553e59426aedfa0e45bfd9efd1a08a6864607d01d6d414646ca26bfc26004d.json
  - graphify-out/cache/semantic/fed7ca43d67afc83f5c49765461f5028ab8ac6cf8d0f274497200be60a74a894.json
  - graphify-out/cache/semantic/167919c3766baabe568b03d75c9a9983154aeaa8513b9606fbbe035b8ecc5504.json
  - graphify-out/cache/semantic/953298b01ebb47f4f0ac33ec322570c8a1f0f71c54751d6e764cb3ee8fac5b82.json
  - graphify-out/cache/semantic/b33c9c10f2abdfd280a1286796f706ca01930aeb2cb3f1e34e6857b716f89c8c.json
  - graphify-out/cache/semantic/60447ca4eb9241f515f5567d5465d99f8abdf76ead0faf8a8ff83ff1a020d1d5.json
-->

---
### Requirement: Good Example section contains no golden-file-only blocks

The Good Example in the pattern library SHALL NOT contain a Sub-agents block or a Compaction block.

The Good Example SHALL use "Hard Rules" (not "Behavior Rules") as the section heading.

#### Scenario: Good Example uses Hard Rules heading

- **WHEN** an advisor reads the Good Example section
- **THEN** the section heading reads "## Hard Rules" (not "## Behavior Rules")

#### Scenario: Good Example has no Sub-agents or Compaction blocks

- **WHEN** an advisor reads the Good Example section
- **THEN** no "## Sub-agents" or "## Compaction" heading appears

<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
-->

<!-- @trace
source: align-claudemd-patterns-with-canonical-template
updated: 2026-06-23
code:
  - graphify-out/cache/semantic/c4cef9b68f5d53ba3b0268a466f90deabffe74154321145184b3b2c92e746c47.json
  - graphify-out/cache/semantic/15c28e7fc33562bf54735dc883e1b5556988ee081fbd3fad807dcd31c0751ec1.json
  - graphify-out/cache/semantic/78518ab7963f8511fc607597b22dae8ebb564602434ca1fc7ffd78ee0fe3a01d.json
  - graphify-out/cache/semantic/2fa27eda4acec43176597698e8553329e00337605047a0d65c1dc5157eea1528.json
  - graphify-out/cache/semantic/7df3d22a3e9933b090589d51ffd2dcdac7442cab01624370288c9ae1148484df.json
  - graphify-out/cache/semantic/c63a18be7c1092b5324a482f233dd8dc17de7af28cab99175d16a92dc6af697b.json
  - graphify-out/cache/semantic/c7c895c90d89e9cd9b4e3950590a81c04e83b4d1fff8e0b4985435060d8e2eb9.json
  - graphify-out/cache/semantic/d6d037cc5fbc7f991cb8b3f41afd2685e8d32201496ee70b13055178e770a907.json
  - graphify-out/cost.json
  - graphify-out/cache/semantic/52de177e49e90a8849d74fcb83feafbe2e4ec428844bfa6bc4227fde909b9042.json
  - graphify-out/cache/semantic/e055b4f794da960d908bea90943d253190690f94af54e90a3eb6a029e5aea58e.json
  - graphify-out/cache/semantic/7c3f4d5c900b4f4774dac25cab0e2193d78a9d8f992d110196364b40457397cf.json
  - graphify-out/cache/semantic/48cbc27761ac6c919aeffa938d8e1129f86a04c26a53a954378922df698a63ce.json
  - .spectra/changes/align-claudemd-patterns-with-canonical-template.started
  - graphify-out/cache/semantic/daa73c5435f7b5ad6f4a04c8cfbc3da2d6a2ce62eb3ff576aff66335c99a7457.json
  - graphify-out/cache/semantic/e4f4acbb4beeddb600a3af72243316e83b9cf9dfd1be35af32e8ec3dfc13bcc6.json
  - src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md
  - graphify-out/cache/semantic/9e7decb73db7ffe161d67b92498a21e9a394034ddf08c19755b7d05ec7731735.json
  - graphify-out/cache/semantic/4024cd44fe7eb512c253fc8c63e96a4c8347e1757f72221d9c6ba6ee0c114bfa.json
  - graphify-out/cache/semantic/1f81019a83c967ad2bff838f8db3a62e608bf48a1f0debe5620bd6affe1676fc.json
  - graphify-out/cache/semantic/dc4407acf80a2367a6be36386c0a9adf2747203d1ea70b44f00e365fb3580161.json
  - graphify-out/cache/semantic/82adcadd1a8760e736381f7a49c9f0388698463e0247a704b3255e298da07212.json
  - graphify-out/cache/semantic/2e4339fde919b35034bfbdc20fb389ab84c2dafb0903e02d667cca34cf3c897e.json
  - graphify-out/cache/semantic/dd0ec26f34c083ae04cfb9ad4a2adfa0211411e59561f734f6d4bfb27bb3ffcb.json
  - graphify-out/cache/semantic/e3fc9770dd41d6f2644a6639301106aa884224d2a6b229592d6368e30d0e6d98.json
  - graphify-out/cache/semantic/c11e49d44a30451e73022776ec8bf6611ce281ee1558dca047bfcf3711c179c3.json
  - graphify-out/cache/semantic/13ac9d0b782317033702a3f801ca5451018892a6a8699788b604b9777b447291.json
  - graphify-out/cache/semantic/bb57a7f92284356a308ce79bfb412ceaa58c07712d6902d4f672efe5d614fa2b.json
  - graphify-out/cache/semantic/35e96865a88747101f22c03654755f935a1d83a69cc0b44c8d50b03e7d9e9086.json
  - graphify-out/.graphify_labels.json
  - graphify-out/cache/semantic/7f1b10bc66d9b86304c6a7759eab4e5296fb495fdf7fd1710cee02705f6d48da.json
  - graphify-out/cache/semantic/bd8628dac7e60e3f2349146f4c1afc12cb217fbb20cc93aa4bb946cb66cdb833.json
  - graphify-out/cache/semantic/485812515c1974342c86c214b769195c6be6a2ca4250f3ccbec8cb4ce8d91007.json
  - graphify-out/cache/semantic/be8a5fb5fa02ce9d4a7179cafb3aee29f7249c0e438b362ccae8110d3a3b9272.json
  - graphify-out/cache/semantic/e18a9fc4cf081e1d4a10f5a82f97a1121819c544ce0e4129347b3e03a5172005.json
  - graphify-out/cache/semantic/286ef28cf6d6f2f33e272b4fe0fba67e71f1d7717093eab6e27588c3d3f5a4ff.json
  - graphify-out/cache/semantic/13b6b88f2a7837fab8e96a50cbb227977056f928248f73f3226ae1d8477eb659.json
  - graphify-out/graph.json
  - graphify-out/cache/semantic/3215f3dc0a999839c33faf1083b8a42be23ffca4922077749ae511cd60ed4dac.json
  - graphify-out/cache/semantic/404e3194ef9150686ce079cc651fc37fe4fc76ad7c450ba3d0c3c3041e2714f4.json
  - graphify-out/cache/semantic/bf9dffdaf41d9f55c80a5fbbc8ecf36afb4e0662f13e71d204d471404f46e64c.json
  - graphify-out/cache/semantic/9d3548f299f2196d47bae975d57ffb5ab44924a1c848f32f479be269b7661d4c.json
  - graphify-out/cache/semantic/8499901ca09af81499ec7a32b524ef190776b34b11cd4d0596960e025f12657f.json
  - graphify-out/cache/semantic/f7f3020cb12a9191ae6f1b5c2f9d6b3a0487c82a4395d97696470514e1a4c06b.json
  - graphify-out/cache/semantic/3255d8ab6709240ca1afb52b90a2fe6c7f167ca095b21f3178b742835cbd43d2.json
  - graphify-out/cache/semantic/b78cd456c3da6afeda800a2b76a55fc339266beb28f04e9d4fc796879cc4788b.json
  - graphify-out/cache/semantic/241717c78c067f69d5acc2a7de091374647ac49336ac243f68225b911dfdb8e4.json
  - graphify-out/cache/semantic/d8be7b99474994cd01a3b7b596c2626592bfc8d42c883ce6d482e21b8ac1611a.json
  - graphify-out/cache/semantic/a65abc71a5912237bd19f84197c462293b1d92a6024db89fab88bb8805d321f0.json
  - graphify-out/cache/semantic/c42fd4d8c851e352ed8de27ccdc82d050b437c7b1c31703235c84d971a6ca5a8.json
  - graphify-out/cache/semantic/b450a2671cd153f5f2d00793595fa0c1461792d63c5d5afd51da7c92659f2509.json
  - graphify-out/cache/semantic/ca72404d5d8b8c1a042dbfa4fb6eefedb7a10b8e0a86d60429dd975fa244ee98.json
  - graphify-out/cache/ast/v0.8.44/e011bb38d69ce6ca916bef32ca23a596e111394a4a69d0bac01f6d4422e692e1.json
  - graphify-out/cache/semantic/1564278f786f145208f4418becb5e087e9c305f6925bee8db1e556b78f4258d0.json
  - graphify-out/cache/semantic/d66cc6e97d687710eeaa911c471df04f217036251d48120dbd18961e72bf7121.json
  - graphify-out/cache/semantic/4fc46ba057e42a58981e3b5845c2d8974228c4ae2736e4b2273b943337e46c92.json
  - graphify-out/cache/semantic/df15782a31b1a17a4ec6de7d1336652c180835fab3f5904ae60bdb1a5698dd7a.json
  - graphify-out/cache/semantic/ec69655b3b3b01c696ea4696bbfd9d4455410a5e8e60217552a1039609ea6c3c.json
  - tasks/borisChernyClaudeMd.md
  - graphify-out/cache/semantic/04711698dd67d226450aff32ebbcb0d03280f19df052922e269f5bd6558f745a.json
  - graphify-out/cache/semantic/c818f33f9faa844e783d03754b9220ca81330a51e7cff8a3d4750eef9960af37.json
  - graphify-out/cache/semantic/c19b330cf7eda3314f82d2e3995955a9f97661895cff654c343cb02d4eff8294.json
  - graphify-out/cache/semantic/53f5c9056957bfdfc52b7d5187cc54af36864996abe4d38b2a70f53995c4ab90.json
  - graphify-out/cache/semantic/31681bb6a086dc2cb06da8c2e69c6d452499902a73073df8dd4d978975d4faa2.json
  - graphify-out/cache/semantic/eb5298226491b7442598f9532f7e9f8d95a3e6ffa1444e6db4fca41bc697d806.json
  - graphify-out/cache/semantic/ac382c6bd763edf573332f6b3aec6aaf9e01f35968babe9069414adebc1c7a13.json
  - graphify-out/cache/semantic/69d13ca8396d00817412c2c7e6711bf820df603c09ee2678464796c4e5fd6515.json
  - graphify-out/cache/semantic/fca81a20b67bc38d9cb8e07ced890d85d4e24c885e26fe561e779d14233d82dc.json
  - graphify-out/cache/semantic/5176ad8f26bf991a7c0e10f56b20305115ecf74fb1520b25a4232d5838d6f2d2.json
  - graphify-out/GRAPH_REPORT.md
  - graphify-out/cache/semantic/1f458a9dac9a1bacbfa28306be5ba67e8a42f3edd48f4d609ad11ce5f3fe9847.json
  - graphify-out/cache/semantic/de4e06f586c9cf9b2b3cd358c26b7bebdb9454198fd28e3b95873969427a50e5.json
  - graphify-out/cache/semantic/75502fb7cc6f0cb7677ad72e6adffa007d7520d315fc2576e88c5ae741d03d41.json
  - graphify-out/cache/semantic/ea8ee411b24a1286d1ad1b24a8948c695952668ad602bfe7378946a724a75f8c.json
  - graphify-out/cache/ast/v0.8.44/b604d3648f723b98f741bf48633af4bc73344e137fd8f08a75f0cd81f49e58fa.json
  - graphify-out/cache/ast/v0.8.44/f48dbf5cad37229732280de2fda8eae627b2aa5efcb41f24986c323a3c5f9365.json
  - graphify-out/cache/semantic/3930ce8cdef5dbbf2a09d93923542a9911b9cc31aa80defa00393a634d265d08.json
  - graphify-out/cache/semantic/55a2d2362807d714499f4a2731e47a668fe5d867b8074af3a56ada31b5677943.json
  - graphify-out/cache/semantic/5b7b5a7fed6b6830355510472a9d03b7e549a1ffa65ec815905fee3d2baf2a3b.json
  - graphify-out/cache/ast/v0.8.44/4c09477cadc21a4125c7c57a2434a8696b1fee71f23dd172ecd7ea200955dd99.json
  - graphify-out/cache/semantic/60e15b393d612db5336a22d4e6adbb3c6c51fa07dbf16cc01a794bc436a62861.json
  - graphify-out/cache/ast/v0.8.44/386401368c66971a3f07a3f56ce8ab9e9153901112b190a4fcf2051c46bdc075.json
  - graphify-out/cache/semantic/7a25d0e1e941fd88d83e5880cd325a48a732ca2640952633f93bc344a0828999.json
  - graphify-out/cache/semantic/83afb8f39e9f95c5645049720d7b497b21920a23ac1ab11512676952326f5299.json
  - graphify-out/cache/semantic/a0ebeb44f7244d90ac5d612fd8e12a240d649ef3c382dbed0fb025b237089985.json
  - graphify-out/graph.html
  - graphify-out/cache/semantic/ed70251e58da3816c8644df29b2b5211e6d74ce7dd816a8654061746ede7e088.json
  - graphify-out/cache/semantic/af0dd5d8d360c157a22c28e89f7697ec95ac0fe4d490e56d1494a904175328e1.json
  - graphify-out/cache/stat-index.json
  - graphify-out/cache/semantic/418ba54c8dcecb21bb27ae58b81e1ab8c98cf655be66267abe1a777858852cf2.json
  - graphify-out/cache/ast/v0.8.44/4ddf5e9458a8a22b201cb0a90a5770643b7d39577622a5b279934c859ce3aef2.json
  - graphify-out/cache/semantic/764b7b7b7656f817e99db4289295b968b5e4a0aa0ba032eaddc6876c21e84634.json
  - graphify-out/cache/semantic/f8e1222dff223e7119d52904f365a2458761491296730d73111d756418063a03.json
  - graphify-out/cache/semantic/e8f9cad313f2fb81dc8f5c5a42955feb9069c4486403d3b8fc01a1b44f02c407.json
  - graphify-out/cache/semantic/46f2b5ebd08d708504f4259f39868ddfdf15109366acaa4069b47f5fa3d01acc.json
  - graphify-out/cache/semantic/03eaf00cbe965e62ceffcc98127b2c4075b9e6c737ed54e1eea3ea6bd8caaefc.json
  - graphify-out/cache/semantic/d549692471c10078e73a087548268c9298907c60873fe991c04136fba1624c7b.json
  - graphify-out/.graphify_python
  - graphify-out/cache/semantic/1d06a280f0b5d6431aad69f6d259cd93941119675d2fde409f12e45afd0e634b.json
  - graphify-out/cache/semantic/37eb647b8cef4372462e4faf10b53e055f762b754de2a289b2b06f1275f08873.json
  - graphify-out/cache/ast/v0.8.44/42cf34065153763fb0663ed89879c6e50fcdb7753b6397b6a33d38518c3aea3c.json
  - graphify-out/cache/semantic/8515b018028115764b5136669a62294b4b3c33e5f9357488f180d4fb5c6e5e10.json
  - graphify-out/cache/semantic/54ab38ac49296b3d3db44b9c9155a66ad0a7618961ff3e177fb4f559afa4ffe1.json
  - graphify-out/cache/semantic/a2b958060ec2d3b4508d31d6971d50d0e6a64844c1e7c0c01b083d33489d3c0d.json
  - graphify-out/cache/semantic/f9ff791c6c95d9dace67f1dd389321f368be5e4f837d02d9b75cda2c9be5dd94.json
  - graphify-out/cache/semantic/3025b0a360bd70abc9dff168bf1d371298a81728f306e0e32e87c1c700b7efb4.json
  - graphify-out/cache/semantic/a6374249375dd8a9efff3bd1f6a04d4ca0eb9a70299b6606577ef6065af1f084.json
  - graphify-out/cache/semantic/6fb4fba0c01239bb87d523d630b860ba4f4bfe6582b17d584cc4399ae063b101.json
  - graphify-out/cache/semantic/a4465690110f5ae8122d600b92075817e1440fcf046d2c5e6b8d296ca847b67b.json
  - graphify-out/cache/semantic/daf278620d4dce79dde6a74e52afdbe79337e5a39a52b471466b465e31577c09.json
  - graphify-out/cache/semantic/81f4c75b353262641a5e34172c5958cebdd59e607b813c9fb4bd76ae84b9b7ea.json
  - graphify-out/cache/ast/v0.8.44/d6df45b4de58cef579af121ff7f7566b0ba52fd06a19a5cb430d5cbae3ce4d6f.json
  - graphify-out/cache/semantic/d91c8c175fca7bd335cb800646b1a492e4a662f79390efc2a33bef2cc9e19e1d.json
  - graphify-out/cache/semantic/26ce1273ad133a0943228a5f07176c95ed385bb450fdcf635c9629eb11621a84.json
  - graphify-out/cache/semantic/2a8876b5505120f3fe877e9533e2214b87c3433eb97e9f0388b8fb5cc8f32866.json
  - graphify-out/cache/semantic/5ee64324ff95f7839fb497b56695cf288bea332857b56986fe405268b6803d66.json
  - graphify-out/cache/semantic/d120bbd6b8d2ee7db78c923dd58afaff727f0262ca47e6660adde5037d2f61c4.json
  - graphify-out/cache/semantic/5756b578c1afc6e11f3fde8c1ed6d68c8c903b5508dc9500c5e1f5135a9a0a0b.json
  - graphify-out/cache/semantic/b66d270a3455b7bc99742d45ff12c848546009e7fbb74e6a8de39b732501ee96.json
  - graphify-out/cache/semantic/6925e2c9eb7efa0e29184bc0d02eaaa250dfc98fccf8d8cd4cf68ca21fbcd5d5.json
  - graphify-out/cache/semantic/be648dbaee8066094a541dacb6060328b8a395264776b75545240716c70c2c54.json
  - graphify-out/cache/semantic/61460724ea9d23dc20c656a37426157b0e519f47dd45e82d254d1113912fb117.json
  - graphify-out/cache/semantic/5d6b8379ba1c8eb39bc57ea5450eb2162bb7e3806798c49b6ba58b28235b744d.json
  - graphify-out/cache/semantic/9c63cd450cdf464ef8e8fd3002d62dda77d8d0950fbcbca13a53fa3735670d98.json
  - graphify-out/cache/semantic/1702c55b9f7996536329d87c20db315b2aa0537fd4bcdb916fd329cf221f152c.json
  - graphify-out/cache/semantic/c0558d27b20437347205804cb156633e5e4318491bbbed2184098d8bd82cf857.json
  - graphify-out/cache/semantic/c3a4b0bb1b96432b0d26e46a5200399619a1f0af8ab7e2fc973c25811223beb8.json
  - graphify-out/cache/semantic/d1f2194401dbb84e56c98a0d166ee228a61e1175ac3d0b8b513f4cf7399a9ea4.json
  - graphify-out/cache/semantic/f4a12812264edfe4063c229a68b86f446f154f6f29439337006c756f9dc82e09.json
  - graphify-out/cache/semantic/dd2711dd2c80914697cdee0a471a409e096e25ebf9e298d7884ffdedc51c4c60.json
  - graphify-out/cache/ast/v0.8.44/574a84a9392c4f7ba5faf7475dd2c1d7b47c5476408d1bce4faba800bc0a9a4a.json
  - graphify-out/cache/semantic/75e5a0f05909f655e6a1f7927048d5903731c8755a6ac6896088eee442e6042e.json
  - graphify-out/cache/semantic/0f14e768c70859ccdc771b8faa81a78f97d20ef64f028b072a6bcd6b62ea13d4.json
  - graphify-out/cache/semantic/be8ae53a6205061665afe5fef67c7b9f64241ef737c45035709b2bc912c0df69.json
  - graphify-out/cache/semantic/4789a8b4cf6e254a9bcc95b905f26917ea83cca88926cc6bde195071a6a99a63.json
  - graphify-out/cache/semantic/474baa2bcd237c68c96539c6f68e8b7a461198d9560632c9fce4c1c39819c926.json
  - graphify-out/cache/semantic/c989cd2911893853a4941e7d5eb1ca7a33ca87f50ef0432adcb463b7395b399f.json
  - graphify-out/cache/semantic/4a50fd8270b73057457032bc7ffb79fbbce30e0f36b96c1ee7f133dc816e81a7.json
  - graphify-out/cache/semantic/541e16aa32fc813d570f5b7f8be9a7970424c341c08ac414d96dc53421c69116.json
  - graphify-out/cache/semantic/3b233a6754cae6a7ec00c998eb21db4e5869c5ec5875f891ce89a03cec9cf58f.json
  - graphify-out/cache/semantic/02bfe00789d054a7c76f739fc6c398adedb8e1dbbf9722b281f6d92bf83a0271.json
  - graphify-out/cache/semantic/ae698ef095bfc85aafac8e304f12e477c267a32199fd6cd7a102fcd5113c9e2b.json
  - graphify-out/cache/semantic/9f10a77fb1d452119cee51a37c77e354e394ce2fbbde2af3dde534f019c0e339.json
  - graphify-out/cache/semantic/9a6a4c4b2ba07576235e946bb844fa5b06717fa6381da99e8fcef09959133ed7.json
  - graphify-out/cache/ast/v0.8.44/4c0d430e23e0a32d12234431b56a6b60af0ea7c7fb0f22ed31ed98b32453f006.json
  - graphify-out/cache/semantic/f5ca7834d7834443da40eb6aef590d58330024f930811f7a25300d004318a045.json
  - graphify-out/.graphify_root
  - graphify-out/cache/semantic/00840100e466a34f28d4590d8b5599e58ecb9abee7391661aeb1ef8d3395f971.json
  - graphify-out/cache/semantic/7589e46f60fc63aba488bb0cfc79a4141081c542ee24b779fb3aea03be915672.json
  - graphify-out/cache/semantic/9fc88904143587a712371d495e0baa42f5b1198b9d0203e7e70200cca5068520.json
  - graphify-out/cache/semantic/bc3763d64d10d52cfa9494181eaa5c0f3c83677582c34ab403fb0d0a03b0b3e8.json
  - graphify-out/cache/semantic/b49db37e0cfbd723612f081dc5c08247c8b0f09c8b3c9b54ed329b9936947549.json
  - graphify-out/cache/semantic/82d5f0c6ae9106955bb06e634959b449b88ef946632cd422fca2b774d162a0ab.json
  - graphify-out/cache/semantic/c8095da5318802edff81d93935072ba324aee73b6a95ecddc0875a6504058560.json
  - graphify-out/cache/semantic/dbbe74f34f30470277fbe432f4b3e751f22f4760c3db01619adbad3f9043ba76.json
  - graphify-out/cache/ast/v0.8.44/d8003394aa45c3820bd613b17355e0e97b5267f821949a3bce464129cfa19158.json
  - graphify-out/cache/semantic/c7847137a048d9bdc3be7a2454190d30a1ce34963b27703ebfe3db2aef6436ee.json
  - graphify-out/cache/semantic/ab003bd3904987bac1962a597b922b0d3ac10e05823a6e285f0e65c15ac5f308.json
  - graphify-out/cache/semantic/d5c563bd888151e85553cb3f1153d6a8b62de905674e3a831169488d76172cea.json
  - graphify-out/cache/ast/v0.8.44/ff7bb897cccbbf5a2d4fcac2c213a9438078ac2df0fb3069a1f15fa88912ca47.json
  - graphify-out/cache/semantic/87ce33d2f7eff5da8b80b13d868bc00a1a5acbb776d5a8fee607abec9ab2e574.json
  - graphify-out/cache/semantic/f7dd8aa42cca86a382392629232ffbfa27ceae5ac4c42de704fbbf88b70de328.json
  - graphify-out/cache/ast/v0.8.44/40ee6cb0a8e93cbd0e7c5bd318e52dd3612b55b848b72b8b8d72c2dac71f3372.json
  - graphify-out/cache/semantic/c3414687ca9085d30bc796743322363bb5513370abd08625f910a9639cd8cbf6.json
  - graphify-out/cache/semantic/aed2536aa56856ebcb5610c6c364cac37543bcab09234ad89716e7a1f62cef46.json
  - graphify-out/cache/semantic/247820da0d7d6fd13800421af373a0051f1b521ec1a9fe8335aeb30a4a8e1c28.json
  - graphify-out/cache/ast/v0.8.44/4cbcd914a9bb5d5b6be63fcba8aa1457ebf94009d55941c038bc072de375cb28.json
  - graphify-out/cache/ast/v0.8.44/1a786b9bb2244dd4f1b26e79bb246848b38636d8fd314425571555f4cda91a87.json
  - graphify-out/cache/semantic/4f24acc4f4d5af198fc81a0dbc4733eec52544c405014dd46d2e0f5c9d4c3d35.json
  - graphify-out/cache/semantic/540e1759cf0c1e149d246eba0ad69767f686b31103fe1835682fc0de4bb2e566.json
  - graphify-out/cache/semantic/955780e0901822aec0e4050ebf07de2591dc412e4ab002882599f0a5200243b4.json
  - graphify-out/cache/semantic/f05794463e030a9105ec4c529341bccdca5ca2f1abe61576822dd572d9659370.json
  - graphify-out/manifest.json
  - graphify-out/cache/semantic/3f720e7a0c4ce9caabcf02bfabd5914f765f216e40473d539ed43c42039c9aed.json
  - graphify-out/cache/semantic/2dc3d5c57a5d1b9b7824ea72fea16a68cbbd28b228f9c27bccbf620cf66e2167.json
  - graphify-out/cache/semantic/fd9c53ae1e751e2ae2260fa07ee2be45e6cbf9237cf2f3b6b3dcededc102f315.json
  - graphify-out/cache/semantic/b7f587b2470ba2c4bcde54aa271fef31b971c9f38ffe042653e0a012298e90b5.json
  - graphify-out/cache/semantic/fd59ec92a6cccb9090d6b1e1f31d724cc3dc7324d1af5a83a36fe9303a2fd813.json
  - graphify-out/cache/semantic/62553e59426aedfa0e45bfd9efd1a08a6864607d01d6d414646ca26bfc26004d.json
  - graphify-out/cache/semantic/fed7ca43d67afc83f5c49765461f5028ab8ac6cf8d0f274497200be60a74a894.json
  - graphify-out/cache/semantic/167919c3766baabe568b03d75c9a9983154aeaa8513b9606fbbe035b8ecc5504.json
  - graphify-out/cache/semantic/953298b01ebb47f4f0ac33ec322570c8a1f0f71c54751d6e764cb3ee8fac5b82.json
  - graphify-out/cache/semantic/b33c9c10f2abdfd280a1286796f706ca01930aeb2cb3f1e34e6857b716f89c8c.json
  - graphify-out/cache/semantic/60447ca4eb9241f515f5567d5465d99f8abdf76ead0faf8a8ff83ff1a020d1d5.json
-->