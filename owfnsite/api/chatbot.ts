import { GoogleGenAI } from "@google/genai";

// Data from constants.ts and lib/locales/*.ts has been moved here to make the Edge Function self-contained.

// --- CONSTANTS ---
const OWFN_MINT_ADDRESS = 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B';

const TOKEN_DETAILS = {
  totalSupply: 18_000_000_000,
  decimals: 9,
  standard: 'SPL Token 2022',
  extensions: 'Transfer Fee (0.5%), Interest-Bearing (2% APR)',
  presalePrice: '1 SOL = 10,000,000 OWFN',
  dexLaunchPrice: '1 SOL = 8,000,000 OWFN',
};

const DISTRIBUTION_WALLETS = {
  presale: '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy',
  impactTreasury: 'HJBKht6wRZYNC7ChJc4TbE8ugT5c3QX6buSbEPNYX1k6',
  community: 'EAS2AHoiQkFQsAA7MafifoeAik9BiNNAeAcpiLZZj1fn',
  team: 'Ku2VLgYsVeoUnksyj7CunAEubsJHwU8VpdeBmAEfLfq',
  marketing: '3kuRooixcDGcz9yuSi6QbCzuqe2Ud5mtsiy3b6M886Ex',
  advisors: '6UokF7FtGK4FXz5Hdr2jm146yC5WqyKkByV5L8fAeAW2',
};

const PROJECT_LINKS = {
  website: 'https://www.owfn.org/',
  x: 'https://x.com/OWFN_Official',
  telegramGroup: 'https://t.me/OWFNOfficial',
  telegramChannel: 'https://t.me/OWFN_Official',
  discord: 'https://discord.gg/DzHm5HCqDW',
};

const TOKEN_ALLOCATIONS = [
  { name: 'Impact Treasury & Social Initiatives', value: 6300000000, percentage: 35 },
  { name: 'Community & Ecosystem Growth', value: 5400000000, percentage: 30 },
  { name: 'Presale & Liquidity', value: 2880000000, percentage: 16 },
  { name: 'Team & Founders', value: 270000000, percentage: 15 },
  { name: 'Marketing & Business Development', value: 540000000, percentage: 3 },
  { name: 'Advisors & Partnerships', value: 180000000, percentage: 1 },
];

const ROADMAP_DATA = [
  { quarter: 'Q3 2025', key_prefix: 'roadmap_q3_2025' },
  { quarter: 'Q4 2025', key_prefix: 'roadmap_q4_2025' },
  { quarter: 'Q1 2026', key_prefix: 'roadmap_q1_2026' },
  { quarter: 'Q2 2026 & Beyond', key_prefix: 'roadmap_q2_2026' },
];

// --- TRANSLATIONS ---
const en = {
    // Navigation
    home: 'Home',
    presale: 'Presale',
    about: 'About',
    whitepaper: 'Whitepaper',
    tokenomics: 'Tokenomics',
    roadmap: 'Roadmap',
    staking: 'Staking',
    vesting: 'Vesting',
    donations: 'Donations',
    dashboard: 'Dashboard',
    profile: 'Profile',
    impact_portal: 'Impact Portal',
    partnerships: 'Partnerships',
    faq: 'FAQ',
    airdrop: 'Airdrop',
    governance: 'Governance',
    maintenance_mode: 'Maintenance Mode',

    // Sidebar Groups
    sidebar_explore: 'Explore',
    sidebar_finance: 'Finance',
    sidebar_engage: 'Engage',

    // General
    connect_wallet: 'Connect Wallet',
    disconnect_wallet: 'Disconnect Wallet',
    change_wallet: 'Change Wallet',
    connected_as: 'Connected as',
    buy_now: 'Buy Now!',
    donate: 'Donate',
    total_supply: 'Total Supply',
    presale_price: 'Presale Price',
    launch_price: 'DEX Launch Price',
    processing: 'Processing...',
    connecting: 'Connecting...',
    connect_wallet_first: 'Please connect your wallet first.',
    yes: 'Yes',
    no: 'No',
    
    // Time Units
    time_days: 'Days',
    time_hours: 'Hours',
    time_minutes: 'Minutes',
    time_seconds: 'Seconds',

    // Home Page
    home_title: 'The Official World Family Network',
    home_subtitle: `A global network united by the vision to build a better world through technology and humanity. We are building a movement that connects families worldwide through blockchain to contribute to real social impact.`,
    core_message_title: 'A Movement We Build Together',
    home_message: `This project's grand vision can only be realized with the support of humanity. By purchasing our token and promoting it among friends, family, and colleagues, you become a vital part of a global movement for change. This isn't just a project; it's a living, breathing force for good that we build together.`,
    home_feature_impact_title: 'Real Impact',
    home_feature_impact_desc: 'Leveraging blockchain for 100% transparent aid in health, education, and basic needs.',
    home_feature_community_title: 'Community Driven',
    home_feature_community_desc: 'Our strength is our community. Your support directly fuels social initiatives worldwide.',
    home_feature_solana_title: 'Powered by Solana',
    home_feature_solana_desc: 'Utilizing the speed and low cost of the Solana blockchain for efficient and scalable operations.',
    
    // About Page
    about_title: 'About OWFN',
    about_subtitle: 'Building a global family united for social good.',
    about_mission_title: 'Our Mission',
    about_mission_desc: `The Official World Family Network (OWFN) is on a mission to build a global network that provides real, 100% transparent support to humanity. We assist people anywhere, anytime, with essential needs by leveraging the power of blockchain technology. Our goal is to create a decentralized system of aid that is efficient, accountable, and accessible to everyone. We believe that by connecting people directly to causes, we can eliminate inefficiencies and ensure that help reaches those who need it most.`,
    about_vision_title: 'Our Vision',
    about_vision_desc: `We envision a world where borders do not limit compassion and support. A world where technology unites us to solve critical global issues like poverty, lack of access to healthcare, and educational disparities. OWFN aims to be more than just a project; it's a movement. A living, breathing force for good, built and sustained by a global community of individuals who believe in a better, more equitable future for all. This vision can only be achieved through collective action and the unwavering support of our community.`,
    about_impact_areas_title: 'Areas of Impact',
    about_impact_health_title: 'Health',
    about_impact_health_desc: 'Covering surgery costs, modernizing hospitals, and providing access to critical medical care.',
    about_impact_education_title: 'Education',
    about_impact_education_desc: 'Building and modernizing schools and kindergartens to provide quality education for future generations.',
    about_impact_needs_title: 'Basic Needs',
    about_impact_needs_desc: 'Providing food, shelter, and clothing for the homeless, and building dignified homes for the elderly.',

    // Roadmap Page
    roadmap_title: 'Roadmap to Global Impact',
    roadmap_subtitle: 'Our journey towards creating a lasting global impact.',
    roadmap_q3_2025_title: 'Foundation',
    roadmap_q3_2025_description: 'Token creation, website launch, building the core community, and establishing initial governance structures.',
    roadmap_q4_2025_title: 'Launch & First Initiatives',
    roadmap_q4_2025_description: 'Official token launch on DEXs, creating the initial liquidity pool, and initiating the first concrete social impact projects.',
    roadmap_q1_2026_title: 'Global Expansion',
    roadmap_q1_2026_description: 'Expanding aid programs to new regions, securing strategic partnerships with NGOs, and developing a transparent voting platform for community members.',
    roadmap_q2_2026_title: 'Sustained Impact',
    roadmap_q2_2026_description: 'Implementing a fully-functional DAO for community decisions, establishing a long-term impact fund, and continuously scaling our efforts to modernize schools, hospitals, and provide essential aid globally.',

    // Tokenomics Page
    tokenomics_title: 'Tokenomics',
    tokenomics_subtitle: 'A transparent and balanced economy for sustainable growth.',
    tokenomics_details_title: 'Token Details',
    tokenomics_allocation_title: 'Token Allocation',
    tokenomics_chart_title: 'Distribution Chart',
    token_decimals: 'Token Decimals',
    token_standard: 'Token Standard',
    token_extensions: 'Active Extensions',
    
    // Presale Page
    presale_join_title: 'Join the Presale',
    presale_ends_in: 'Presale Ends In',
    progress: 'Progress',
    sol_collected: 'SOL Collected',
    you_pay: 'You Pay',
    you_receive: 'You Receive',
    min_buy: 'Min buy',
    max_buy: 'Max buy',
    invalid_amount: 'Amount must be between {min} and {max} SOL.',
    presale_purchase_success_alert: `Purchase successful! You contributed {amount} SOL. Your {owfnAmount} OWFN tokens are reserved and will be automatically airdropped to your wallet at the end of the presale.`,
    presale_header_subtitle: 'Official World Family Network - $OWFN',
    presale_sold_progress: 'Sold {progress}%',
    presale_buy_info: 'Buy (Min: {min} SOL, Max: {max} SOL)',
    presale_buy_info_max_only: 'Buy (Max: {max} SOL per wallet)',
    buy: 'Buy',
    presale_buying_owfn: 'Buying {amount} $OWFN',
    presale_estimate_tooltip: 'This is an estimate. The final amount may vary.',
    presale_whitelist_finished: 'Whitelist Sale Finished:',
    presale_public_ending_in: 'Public Sale Ending in:',
    presale_project_info_title: 'Project Information',
    token_name_label: 'Token Name',
    token_symbol_label: 'Token Symbol',
    token_supply_label: 'Token Supply',
    presale_sale_rate_label: 'Sale Rate',
    presale_listing_rate_label: 'Listing Rate',
    presale_softcap_label: 'Softcap',
    presale_hardcap_label: 'Hardcap',
    presale_token_address_label: 'Token Address',
    presale_start_time_label: 'Sale Start Time',
    presale_end_time_label: 'Sale End Time',
    view_full_details: 'View full details →',
    presale_dyor_nfa_title: 'DYOR, NFA',
    presale_dyor_nfa_desc: 'Do Your Own Research. Not Financial Advice.',
    presale_footer_copyright: '© {year} Official World Family Network | All rights reserved.',
    presale_amount_error: 'The amount must be between {min} and {max} SOL.',
    presale_max_amount_error: 'The amount must not exceed {max} SOL.',
    live_presale_feed: 'Live Presale Feed',
    wallet: 'Wallet',
    sol_spent: 'SOL Spent',
    owfn_received: 'OWFN Received',
    time: 'Time',
    just_now: 'Just now',
    presale_you_contributed: 'You have already contributed: {amount} SOL.',
    presale_you_can_buy: 'You can contribute up to {amount} more SOL.',
    
    // Donations Page
    make_donation: 'Make a Donation',
    donation_desc: 'Support our social impact initiatives by donating crypto. All funds go directly to the Impact Treasury.',
    donation_solana_warning: `IMPORTANT: Donations for USDC and USDT are currently accepted ONLY from the Solana network. Do not send from any other network (e.g., Ethereum) as the funds will be lost and will not reach their destination.`,
    select_token: 'Select Token',
    amount: 'Amount',
    donations_form_title: 'Donation Form',
    donations_stats_title: 'Live Donation Stats (Simulated)',
    donated: 'Donated',
    donation_success_alert: 'Donation successful! Thank you for your contribution of {amount} {tokenSymbol}.',
    donation_no_token_balance: 'You do not own any {symbol}.',
    
    // Dashboard
    wallet_monitor: 'Wallet Monitor Dashboard',
    wallet_monitor_desc: 'Real-time monitoring of the official project wallets for full transparency.',
    total_value: 'Total Value',
    wallet_name_presale: 'Presale & Liquidity',
    wallet_name_impact_treasury: 'Impact Treasury',
    wallet_name_community: 'Community & Ecosystem',
    wallet_name_team: 'Team & Founders',
    wallet_name_marketing: 'Marketing & Biz Dev',
    wallet_name_advisors: 'Advisors & Partnerships',
    
    // Profile
    my_profile: 'My Profile',
    my_tokens: 'My Tokens',
    token_types: 'Token Types',
    profile_loading_tokens: 'Loading tokens...',
    profile_connect_prompt: 'Connect your wallet to see your profile and token balances.',
    profile_no_tokens: 'No tokens found in this wallet.',
    impact_dashboard_title: 'My Impact Dashboard',
    my_impact_stats: 'My Impact Stats',
    total_donated: 'Total Donated',
    projects_supported: 'Projects Supported',
    votes_cast: 'Votes Cast',
    impact_trophies_nfts: 'Impact Trophies (NFTs)',
    impact_badges: 'Impact Badges',
    badge_first_donation: 'First Donor',
    badge_first_donation_desc: 'Awarded for making your first donation.',
    badge_community_voter: 'Community Voter',
    badge_community_voter_desc: 'Awarded for participating in 5 governance votes.',
    badge_diverse_donor: 'Diverse Donor',
    badge_diverse_donor_desc: 'Awarded for donating to projects in 3 different categories.',
    asset: 'Asset',
    value_usd: 'Value (USD)',

    // Impact Portal
    social_cases: 'Social Cases',
    social_cases_desc: 'Explore and support the social impact cases funded by the OWFN community.',
    category: 'Category',
    goal: 'Goal',
    funded: 'Funded',
    view_case: 'View Case',
    admin_portal: 'Admin Portal',
    create_new_case: 'Create New Social Case',
    case_title: 'Case Title',
    case_description: 'Case Description',
    image_url: 'Image URL',
    funding_goal_usd: 'Funding Goal (USD)',
    save_case: 'Save Case',
    case_details: 'Case Details (e.g., breakdown of costs, timeline)',
    case_details_title: 'Case Details',
    back_to_all_cases: 'Back to all cases',
    back_to_category_cases: 'Back to {category} cases',
    support_this_cause: 'Support this Cause',
    case_not_found: 'Case not found',
    case_donation_success_alert: 'Thank you for your donation to "{title}"!',
    admin_saving_case: 'Translating & Saving...',
    admin_fill_fields_alert: 'Please fill all required fields.',
    category_health: 'Health',
    category_education: 'Education',
    category_basic_needs: 'Basic Needs',
    live_updates: 'Live Updates',
    funding_milestones: 'Funding Milestones',
    milestone_25: 'Initial funding secured for materials.',
    milestone_50: 'Construction/Implementation begins.',
    milestone_75: 'Mid-project report and verification.',
    milestone_100: 'Project complete and final report issued.',
    case_update_1: 'Materials have arrived on site. Construction is set to begin next week!',
    case_update_2: 'Architectural plans have been finalized and approved by local authorities.',
    case_update_3: 'Project funding officially began. We are grateful for the first wave of support from the OWFN community.',

    // Partnerships Page
    partnerships_title: 'Partnerships',
    partnerships_subtitle: 'We are actively seeking partnerships with NGOs, corporations, and other projects.',
    partnerships_contact_info: 'Contact us at partnerships@owfn.org to collaborate.',

    // FAQ Page
    faq_title: 'Frequently Asked Questions',
    faq_subtitle: 'Find answers to the most common questions about OWFN.',
    faq_q1: 'What is OWFN?',
    faq_a1: `OWFN (Official World Family Network) is a Solana-based token designed to unite families globally through blockchain technology, focusing on social impact, education, health, and humanitarian aid with full transparency.`,
    faq_q2: 'How can I buy OWFN tokens?',
    faq_a2: `You can participate in the OWFN token presale directly through the link provided in the "Presale" section of our website. Make sure you have SOL (Solana) in your wallet to make the purchase.`,
    faq_q3: 'What is the total supply of OWFN tokens?',
    faq_a3: `The total supply of OWFN tokens is 18_000_000_000 (18 Billion) OWFN.`,
    faq_q4: 'How does OWFN ensure transparency in its social impact initiatives?',
    faq_a4: `OWFN utilizes the Solana blockchain to record all transactions related to its Impact Treasury. This ensures that every donation and allocation is publicly verifiable and immutable, providing full transparency.`,
    faq_q5: 'What does 2% APY mean for OWFN holders?',
    faq_a5: `OWFN is an Interest-Bearing Token (IBT) that automatically rewards its holders with a 2% Annual Percentage Yield (APY). This means your OWFN holdings will grow over time simply by keeping them in your wallet.`,
    faq_q6: 'Where can I find the OWFN Whitepaper?',
    faq_a6: `You can find the detailed OWFN Whitepaper by clicking on the "Whitepaper" button in the header or the main section of our website.`,
    faq_q7: `How does OWFN make a real-world difference?`,
    faq_a7: `OWFN directly funds initiatives in critical areas such as healthcare (e.g., covering surgery costs, hospital modernization), education (e.g., building and renovating schools, kindergartens), and basic needs (e.g., providing food, shelter, clothing for the homeless, establishing nursing homes). We also respond to disaster relief and invest in sustainable community development projects. Every token contributes to these concrete actions, ensuring 100% real support for humanity.`,
    faq_q8: `How does my contribution, through buying tokens, truly help?`,
    faq_a8: `When you purchase OWFN tokens, a significant portion of the funds goes directly into the Impact Treasury. This treasury is specifically allocated to finance our social impact projects. The blockchain technology ensures complete transparency, meaning you can verify how funds are utilized. Your purchase isn't just an investment; it's a direct contribution to a fund dedicated to improving lives and communities worldwide.`,
    faq_q9: `Beyond buying tokens, how else can I get involved and help OWFN?`,
    faq_a9: `Your involvement is crucial! Spreading the word about OWFN is incredibly powerful. Talk to your friends, family, and colleagues about our mission. Share our vision on social media, during your travels, or at work. Every conversation, every share, helps raise awareness and brings more people into our global family, amplifying our collective impact. Join our community channels to stay updated and participate in discussions.`,
    faq_q10: `Are there special instructions for donating USDC or USDT?`,
    faq_a10: `Yes, this is critically important. All donations of USDC and USDT must be sent *exclusively* from the Solana blockchain. Do not send from any other network (e.g., Ethereum), as the funds will be lost and will not reach their destination. This information is clearly displayed on the donations page as well.`,

    // Chatbot
    chatbot_title: 'OWFN Assistant',
    chatbot_placeholder: 'Ask a question...',
    chatbot_error: 'Sorry, I am having trouble connecting. Please try again later.',
    
    // Whitepaper
    whitepaper_title: 'OWFN Whitepaper',
    whitepaper_subtitle: 'A Detailed Overview of the Official World Family Network Project',
    whitepaper_features_title: 'Project Ecosystem & Features',
    whitepaper_features_desc: 'The OWFN platform provides several key functionalities to support its mission:',
    whitepaper_feature_presale: 'Allows early supporters to purchase OWFN tokens before the public launch.',
    whitepaper_feature_donations: 'A dedicated portal for making direct crypto donations to the Impact Treasury.',
    whitepaper_feature_dashboard: 'Offers real-time monitoring of all official project wallets for complete transparency.',
    whitepaper_feature_impact_portal: 'Showcases specific social cases being funded by the project, allowing the community to see their impact.',
    whitepaper_community_title: 'Community & Official Links',
    whitepaper_community_desc: 'Join our growing community and stay up to date with the latest news:',

    // Alerts & Messages
    transaction_success_alert: 'Transaction successful! You sent {amount} {tokenSymbol}.',
    transaction_failed_alert: 'Transaction failed. Please try again.',
    translation_error_alert: 'An error occurred during translation. The case was not created. Please try again.',
    invalid_amount_generic: 'Please enter a valid amount.',
    vote_success_alert: 'Your vote has been cast successfully!',

    // Footer
    footer_copyright: '© {year} Official World Family Network. All Rights Reserved.',

    // Token Detail Page
    token_detail_title: 'Token Analytics',
    back_to_dashboard: 'Back to Dashboard',
    back_to_profile: 'Back to Profile',
    token_not_found: 'Token data not found.',
    token_description_title: 'TOKEN DESCRIPTION',
    sell: 'Sell',
    market_cap: 'Market Cap',
    liquidity: 'Liquidity',
    volume_24h: '24h Volume',
    pair_address: 'Pair Address',
    mint_authority: 'Mint Authority',
    freeze_authority: 'Freeze Authority',
    fully_diluted_valuation: 'Fully Diluted Valuation (FDV)',
    market_stats: 'Market Stats',
    trading_activity: 'Trading Activity',
    buys_24h: 'Buys (24h)',
    sells_24h: 'Sells (24h)',
    total_transactions_24h: 'Total Transactions (24h)',
    token_supply: 'Token Supply',
    decimals: 'Decimals',
    pool_info: 'Pool Info',
    exchange: 'Exchange',
    pool_age: 'Pool Age',
    on_chain_security: 'On-Chain Security',
    update_authority: 'Update Authority',

    // Staking & Vesting
    staking_title: 'Stake OWFN, Earn Rewards',
    staking_subtitle: 'Lock your OWFN tokens to earn rewards and support the network.',
    total_staked: 'Total Staked',
    estimated_apy: 'Estimated APY',
    my_staked_balance: 'My Staked Balance',
    stake: 'Stake',
    unstake: 'Unstake',
    balance: 'Balance',
    stake_owfn: 'Stake OWFN',
    unstake_owfn: 'Unstake OWFN',
    my_rewards: 'My Rewards',
    claim_rewards: 'Claim Rewards',
    staking_connect_title: 'Connect to Stake',
    staking_connect_prompt: 'Connect your wallet to start staking your OWFN tokens and earning rewards.',
    stake_success_alert: 'Successfully staked {amount} OWFN!',
    unstake_success_alert: 'Successfully unstaked {amount} OWFN!',
    claim_success_alert: 'Successfully claimed {amount} OWFN rewards!',
    impact_staking_title: 'Impact Staking',
    impact_staking_desc: 'Contribute a portion of your staking rewards to social causes.',
    donate_rewards_percentage: 'You will donate {percentage}% of your claimed rewards to the Impact Treasury.',
    vesting_title: 'Token Vesting',
    vesting_subtitle: 'Track your token vesting schedules and claim unlocked tokens.',
    vesting_connect_title: 'Connect to View Vesting',
    vesting_connect_prompt: 'Connect your wallet to view your personal vesting schedules.',
    no_vesting_schedule: 'No Vesting Schedule Found',
    no_vesting_schedule_desc: 'There is no vesting schedule associated with the connected wallet address.',
    my_vesting_schedule: 'My Vesting Schedule',
    total_allocation: 'Total Allocation',
    claimed: 'Claimed',
    remaining: 'Remaining',
    vesting_progress: 'Vesting Progress',
    start_date: 'Start Date',
    end_date: 'End Date',
    cliff_period: 'Cliff Period End',
    claimable_now: 'Claimable Now',
    claim_tokens: 'Claim Tokens',
    vesting_claim_success: 'Successfully claimed {amount} vested OWFN tokens!',
    create_vesting_schedule: 'Create New Vesting Schedule',
    recipient_address: 'Recipient Address',
    total_amount_owfn: 'Total Amount (OWFN)',
    vesting_duration_months: 'Vesting Duration (in months)',
    cliff_period_months: 'Cliff Period (in months)',
    create_schedule: 'Create Schedule',
    vesting_schedule_created: 'Vesting schedule created successfully!',
    all_vesting_schedules: 'All Vesting Schedules',

    // Airdrop
    airdrop_title: 'OWFN Token Airdrop',
    airdrop_subtitle: 'Check your eligibility for our community airdrops and rewards.',
    airdrop_check_eligibility: 'Check My Eligibility',
    airdrop_checking: 'Checking Eligibility...',
    airdrop_connect_prompt: 'Connect your wallet to check if you are eligible for the airdrop.',
    airdrop_congratulations: 'Congratulations!',
    airdrop_eligible_message: 'Your wallet is eligible! You will receive {amount} OWFN tokens in the upcoming distribution.',
    airdrop_not_eligible: 'Not Eligible',
    airdrop_not_eligible_message: 'Sorry, this wallet address is not eligible for the current airdrop. Stay active in our community for future opportunities!',
    airdrop_info_box_title: 'About This Airdrop',
    airdrop_info_box_desc: 'This airdrop is designed to reward early supporters and active community members. Eligibility is based on factors like participation in the presale and engagement in community events.',

    // Governance
    governance_title: 'Governance',
    governance_subtitle: 'Participate in the future of OWFN by voting on proposals.',
    active_proposals: 'Active Proposals',
    past_proposals: 'Past Proposals',
    create_proposal: 'Create Proposal',
    proposal_title: 'Proposal Title',
    proposal_description: 'Description',
    submit_proposal: 'Submit Proposal',
    vote_for: 'Vote For',
    vote_against: 'Vote Against',
    votes_for: 'For',
    votes_against: 'Against',
    ends_in: 'Ends in',
    status_active: 'Active',
    status_passed: 'Passed',
    status_failed: 'Failed',
    you_voted: 'You Voted',
    no_active_proposals: 'There are currently no active proposals.',
    no_past_proposals: 'There are no past proposals to display.',
    no_active_cases_in_category: 'No active cases in this category at the moment.',

    // Maintenance
    maintenance_heading: "We're making things better!",
    maintenance_message: "Our platform is currently undergoing scheduled maintenance to improve your experience. We appreciate your patience and understanding. We'll be back online shortly.",
    maintenance_stay_tuned: "Stay tuned for updates on our social channels:",
    admin_controls: "Admin Controls",
    maintenance_status: "Status",
    maintenance_status_active: "ACTIVE",
    maintenance_status_inactive: "INACTIVE",
    activate_maintenance_mode: "Activate Maintenance",
    deactivate_maintenance_mode: "Deactivate Maintenance",
    admin_login: "Admin Login",
    maintenance_login_denied: 'Connection denied. The platform is in maintenance mode. Only administrators can log in.',

    // Coming Soon
    coming_soon_title: 'Coming Soon',
    coming_soon_desc: 'This feature is currently under development. We are working hard to bring it to you soon. Thank you for your patience and support.',

    // Admin Presale
    presale_admin_title: 'Presale Admin',
    presale_admin_subtitle: 'Monitor transactions and manage the post-presale token airdrop.',
    total_sol_raised: 'Total SOL Raised',
    total_transactions: 'Total Transactions',
    unique_contributors: 'Unique Contributors',
    refresh_data: 'Refresh Data',
    export_csv: 'Export as CSV',
    presale_purchases: 'Presale Purchases',
    contributor: 'Contributor',
    sol_amount: 'SOL Amount',
    owfn_to_receive: 'OWFN to Receive',
    date: 'Date',
    transaction: 'Transaction',
    airdrop_tool_title: 'Airdrop Distribution Tool',
    airdrop_warning: 'WARNING: This tool will initiate the mass distribution of OWFN tokens to all presale contributors. This action is irreversible. Ensure the presale has officially ended and all data is correct.',
    total_owfn_to_distribute: 'Total OWFN to Distribute',
    your_owfn_balance: 'Your OWFN Balance',
    insufficient_owfn_balance: 'Insufficient OWFN balance to perform airdrop.',
    your_sol_balance: 'Your SOL Balance (for fees)',
    insufficient_sol_balance: 'Insufficient SOL balance for transaction fees.',
    estimated_tx_fees: 'Estimated transaction fees',
    start_airdrop: 'Start Airdrop',
    airdrop_confirmation_prompt: 'Are you sure you want to start the airdrop? This will send OWFN tokens to {count} unique wallets and cannot be undone.',
    airdrop_in_progress: 'Airdrop in Progress... Do not close this window.',
    processing_batch: 'Processing batch {current} of {total}...',
    airdrop_complete: 'Airdrop Complete',
    airdrop_summary: '{success} successful, {failed} failed.',
    airdrop_log: 'Airdrop Log',
};
// Additional language files would be defined here...
const zh = {
    // Navigation
    home: '首页',
    presale: '预售',
    about: '关于我们',
    whitepaper: '白皮书',
    tokenomics: '代币经济学',
    roadmap: '路线图',
    staking: '质押',
    vesting: '归属',
    donations: '捐赠',
    dashboard: '仪表板',
    profile: '个人资料',
    impact_portal: '影响力门户',
    partnerships: '合作伙伴',
    faq: '常见问题',
    airdrop: '空投',
    governance: '治理',
    maintenance_mode: '维护模式',

    // Sidebar Groups
    sidebar_explore: '探索',
    sidebar_finance: '金融',
    sidebar_engage: '参与',

    // General
    connect_wallet: '连接钱包',
    disconnect_wallet: '断开钱包',
    change_wallet: '更换钱包',
    connected_as: '已连接为',
    buy_now: '立即购买！',
    donate: '捐赠',
    total_supply: '总供应量',
    presale_price: '预售价格',
    launch_price: 'DEX 上市价格',
    processing: '处理中...',
    connecting: '连接中...',
    connect_wallet_first: '请先连接您的钱包。',
    yes: '是',
    no: '否',

    // Time Units
    time_days: '天',
    time_hours: '小时',
    time_minutes: '分钟',
    time_seconds: '秒',

    // Home Page
    home_title: '官方世界家庭网络',
    home_subtitle: '一个通过技术和人性建设更美好世界的愿景联合起来的全球网络。我们正在建立一个通过区块链连接全球家庭的运动，为真正的社会影响做出贡献。',
    core_message_title: '我们共同建立的运动',
    home_message: '这个项目的宏伟愿景只有在人类的支持下才能实现。通过购买我们的代币并在朋友、家人和同事中推广，您将成为全球变革运动的重要组成部分。这不仅仅是一个项目；它是我们共同建立的一个活生生的、为善的力量。',
    home_feature_impact_title: '实际影响',
    home_feature_impact_desc: '利用区块链为健康、教育和基本需求提供 100% 透明的援助。',
    home_feature_community_title: '社区驱动',
    home_feature_community_desc: '我们的力量在于我们的社区。您的支持直接推动了全球的社会倡议。',
    home_feature_solana_title: '由 Solana 提供支持',
    home_feature_solana_desc: '利用 Solana 区块链的速度和低成本实现高效和可扩展的操作。',
    
    // About Page
    about_title: '关于 OWFN',
    about_subtitle: '为了社会公益而建立一个团结的全球家庭。',
    about_mission_title: '我们的使命',
    about_mission_desc: '官方世界家庭网络（OWFN）的使命是建立一个为人类提供真实、100% 透明支持的全球网络。我们利用区块链技术的力量，随时随地为有需要的人们提供基本需求。我们的目标是创建一个高效、负责、人人可及的去中心化援助系统。我们相信，通过将人们直接与事业联系起来，我们可以消除低效率，确保帮助能够到达最需要的人手中。',
    about_vision_title: '我们的愿景',
    about_vision_desc: '我们设想一个国界不限制同情和支持的世界。一个技术将我们团结起来，解决贫困、医疗保健不足和教育差距等关键全球问题的世界。OWFN 的目标不仅仅是一个项目；它是一个运动。一个由相信为所有人创造更美好、更公平未来的全球个人社区建立和维持的、活生生的、为善的力量。这一愿景只能通过集体行动和我们社区坚定不移的支持来实现。',
    about_impact_areas_title: '影响领域',
    about_impact_health_title: '健康',
    about_impact_health_desc: '支付手术费用，现代化医院，并提供关键医疗服务的机会。',
    about_impact_education_title: '教育',
    about_impact_education_desc: '建设和现代化学校和幼儿园，为子孙后代提供优质教育。',
    about_impact_needs_title: '基本需求',
    about_impact_needs_desc: '为无家可归者提供食物、住所和衣物，并为老年人建造有尊严的家园。',
    
    // Roadmap Page
    roadmap_title: '实现全球影响力的路线图',
    roadmap_subtitle: '我们创造持久全球影响力的旅程。',
    roadmap_q3_2025_title: '基础',
    roadmap_q3_2025_description: '代币创建，网站启动，核心社区建设，以及建立初步的治理结构。',
    roadmap_q4_2025_title: '启动和初步倡议',
    roadmap_q4_2025_description: '在 DEX 上正式推出代币，创建初始流动性池，并启动第一个具体的社会影响项目。',
    roadmap_q1_2026_title: '全球扩张',
    roadmap_q1_2026_description: '将援助项目扩展到新地区，与非政府组织建立战略合作伙伴关系，并为社区成员开发一个透明的投票平台。',
    roadmap_q2_2026_title: '持续影响',
    roadmap_q2_2026_description: '为社区决策实施一个功能齐全的 DAO，建立一个长期的影响力基金，并不断扩大我们现代化学校、医院和在全球范围内提供基本援助的努力。',
    
    // Tokenomics Page
    tokenomics_title: '代币经济学',
    tokenomics_subtitle: '一个透明、平衡的经济体，实现可持续增长。',
    tokenomics_details_title: '代币详情',
    tokenomics_allocation_title: '代币分配',
    tokenomics_chart_title: '分配图',
    token_decimals: '代币小数位数',
    token_standard: '代币标准',
    token_extensions: '活动扩展',

    // Presale Page
    presale_join_title: '加入预售',
    presale_ends_in: '预售结束倒计时',
    progress: '进度',
    sol_collected: '已募集 SOL',
    you_pay: '您支付',
    you_receive: '您收到',
    min_buy: '最小购买量',
    max_buy: '最大购买量',
    invalid_amount: '金额必须在 {min} 和 {max} SOL 之间。',
    presale_purchase_success_alert: '购买成功！您贡献了 {amount} SOL。您的 {owfnAmount} OWFN 代币已预留，并将在预售结束时自动空投到您的钱包。',
    presale_header_subtitle: '官方世界家庭网络 - $OWFN',
    presale_sold_progress: '已售出 {progress}%',
    presale_buy_info: '购买（最小：{min} SOL，最大：{max} SOL）',
    presale_buy_info_max_only: 'Buy (Max: {max} SOL per wallet)',
    buy: '购买',
    presale_buying_owfn: '正在购买 {amount} $OWFN',
    presale_estimate_tooltip: '这是一个估算值，最终金额可能会有所不同。',
    presale_whitelist_finished: '白名单销售已结束：',
    presale_public_ending_in: '公售结束倒计时：',
    presale_project_info_title: '项目信息',
    token_name_label: '代币名称',
    token_symbol_label: '代币符号',
    token_supply_label: '代币供应量',
    presale_sale_rate_label: '销售汇率',
    presale_listing_rate_label: '上市汇率',
    presale_softcap_label: '软顶',
    presale_hardcap_label: '硬顶',
    presale_token_address_label: '代币地址',
    presale_start_time_label: '销售开始时间',
    presale_end_time_label: '销售结束时间',
    view_full_details: '查看全部详情 →',
    presale_dyor_nfa_title: 'DYOR, NFA',
    presale_dyor_nfa_desc: '请自行研究。非财务建议。',
    presale_footer_copyright: '© {year} 官方世界家庭网络 | 保留所有权利。',
    presale_amount_error: '金额必须在 {min} 和 {max} SOL 之间。',
    presale_max_amount_error: 'Amount must not exceed {max} SOL.',
    live_presale_feed: '实时预售动态',
    wallet: '钱包',
    sol_spent: '花费的 SOL',
    owfn_received: '收到的 OWFN',
    time: '时间',
    just_now: '刚刚',
    
    // Donations Page
    make_donation: '进行捐赠',
    donation_desc: '通过捐赠加密货币来支持我们的社会影响力倡议。所有资金将直接进入影响力金库。',
    donation_solana_warning: '重要提示：USDC 和 USDT 的捐赠目前仅接受来自 Solana 网络。请勿从任何其他网络（例如以太坊）发送，否则资金将丢失且无法到达目的地。',
    select_token: '选择代币',
    amount: '金额',
    donations_form_title: '捐赠表格',
    donations_stats_title: '实时捐赠统计（模拟）',
    donated: '已捐赠',
    donation_success_alert: '捐赠成功！感谢您捐赠 {amount} {tokenSymbol}。',
    donation_no_token_balance: '您没有任何 {symbol}。',
    
    // Dashboard
    wallet_monitor: '钱包监控仪表板',
    wallet_monitor_desc: '为实现完全透明而对官方项目钱包进行实时监控。',
    total_value: '总价值',
    wallet_name_presale: '预售与流动性',
    wallet_name_impact_treasury: '影响力金库',
    wallet_name_community: '社区与生态系统',
    wallet_name_team: '团队与创始人',
    wallet_name_marketing: '市场营销与业务发展',
    wallet_name_advisors: '顾问与合作伙伴',
    
    // Profile
    my_profile: '我的个人资料',
    my_tokens: '我的代币',
    token_types: '代币类型',
    profile_loading_tokens: '正在加载代币...',
    profile_connect_prompt: '连接您的钱包以查看您的个人资料和代币余额。',
    profile_no_tokens: '此钱包中未找到任何代币。',
    impact_dashboard_title: '我的影响力仪表板',
    my_impact_stats: '我的影响力统计',
    total_donated: '总捐赠额',
    projects_supported: '支持的项目',
    votes_cast: '已投票数',
    impact_trophies_nfts: '影响力奖杯 (NFT)',
    impact_badges: '影响力徽章',
    badge_first_donation: '首次捐赠者',
    badge_first_donation_desc: '为您的首次捐赠而颁发。',
    badge_community_voter: '社区投票者',
    badge_community_voter_desc: '为参与 5 次治理投票而颁发。',
    badge_diverse_donor: '多元化捐赠者',
    badge_diverse_donor_desc: '为向 3 个不同类别的项目捐赠而颁发。',
    asset: '资产',
    value_usd: '价值 (USD)',
    
    // Impact Portal
    social_cases: '社会案例',
    social_cases_desc: '探索并支持由 OWFN 社区资助的社会影响力案例。',
    category: '类别',
    goal: '目标',
    funded: '已筹集',
    view_case: '查看案例',
    admin_portal: '管理门户',
    create_new_case: '创建新的社会案例',
    case_title: '案例标题',
    case_description: '案例描述',
    image_url: '图片 URL',
    funding_goal_usd: '筹款目标 (USD)',
    save_case: '保存案例',
    case_details: '案例详情（例如成本明细、时间表）',
    case_details_title: '案例详情',
    back_to_all_cases: '返回所有案例',
    back_to_category_cases: '返回 {category} 案例',
    support_this_cause: '支持此事业',
    case_not_found: '未找到案例',
    case_donation_success_alert: '感谢您对“{title}”的捐赠！',
    admin_saving_case: '正在翻译和保存...',
    admin_fill_fields_alert: '请填写所有必填字段。',
    category_health: '健康',
    category_education: '教育',
    category_basic_needs: '基本需求',
    live_updates: '实时更新',
    funding_milestones: '资金里程碑',
    milestone_25: '已获得材料的初步资金。',
    milestone_50: '建设/实施开始。',
    milestone_75: '项目中期报告和验证。',
    milestone_100: '项目完成并发布最终报告。',
    case_update_1: '材料已运抵现场。建设计划于下周开始！',
    case_update_2: '建筑计划已最终确定并获得地方当局批准。',
    case_update_3: '项目资金正式启动。我们感谢 OWFN 社区的第一波支持。',

    // Partnerships Page
    partnerships_title: '合作伙伴',
    partnerships_subtitle: '我们正在积极寻求与非政府组织、企业和其他项目的合作。',
    partnerships_contact_info: '请通过 partnerships@owfn.org 联系我们进行合作。',

    // FAQ Page
    faq_title: '常见问题',
    faq_subtitle: '查找有关 OWFN 最常见问题的答案。',
    faq_q1: '什么是 OWFN？',
    faq_a1: 'OWFN（官方世界家庭网络）是一个基于 Solana 的代币，旨在通过区块链技术将全球家庭团结起来，重点关注社会影响、教育、健康和人道主义援助，并实现完全透明。',
    faq_q2: '我如何购买 OWFN 代币？',
    faq_a2: '您可以直接通过我们网站“预售”部分提供的链接参与 OWFN 代币预售。请确保您的钱包中有 SOL（Solana）以进行购买。',
    faq_q3: 'OWFN 代币的总供应量是多少？',
    faq_a3: 'OWFN 代币的总供应量为 18,000,000,000（180 亿）OWFN。',
    faq_q4: 'OWFN 如何确保其社会影响力倡议的透明度？',
    faq_a4: 'OWFN 利用 Solana 区块链记录与其影响力金库相关的所有交易。这确保了每笔捐赠和分配都是公开可验证和不可篡改的，从而提供了完全的透明度。',
    faq_q5: 'OWFN 持有者的 2% APY 是什么意思？',
    faq_a5: 'OWFN 是一种计息代币（IBT），它会自动以 2% 的年收益率（APY）奖励其持有者。这意味着您的 OWFN 持有量会随着时间的推移而增长，只需将其保存在您的钱包中即可。',
    faq_q6: '我在哪里可以找到 OWFN 白皮书？',
    faq_a6: '您可以通过点击我们网站页眉或主要部分的“白皮书”按钮找到详细的 OWFN 白皮书。',
    faq_q7: 'OWFN 如何在现实世界中产生影响？',
    faq_a7: 'OWFN 直接资助健康（例如支付手术费用、现代化医院）、教育（例如建设和翻新学校、幼儿园）和基本需求（例如为无家可归者提供食物、住所、衣物，建立养老院）等关键领域的倡议。我们还应对灾难救援并投资于可持续的社区发展项目。每个代币都为这些具体行动做出贡献，确保为人类提供 100% 的真实支持。',
    faq_q8: '通过购买代币，我的贡献如何真正提供帮助？',
    faq_a8: '当您购买 OWFN 代币时，大部分资金将直接进入影响力金库。该金库专门用于资助我们的社会影响力项目。区块链技术确保了完全的透明度，这意味着您可以验证资金的使用方式。您的购买不仅仅是一项投资；它是对致力于改善全球生活和社区的基金的直接贡献。',
    faq_q9: '除了购买代币，我还能如何参与并帮助 OWFN？',
    faq_a9: '您的参与至关重要！宣传 OWFN 的力量非常强大。向您的朋友、家人和同事讲述我们的使命。在社交媒体、旅行中或工作中分享我们的愿景。每一次对话、每一次分享都有助于提高认识，并将更多人带入我们的全球大家庭，从而扩大我们的集体影响力。加入我们的社区渠道以获取最新信息并参与讨论。',
    faq_q10: '捐赠 USDC 或 USDT 有什么特别说明吗？',
    faq_a10: '是的，这非常重要。所有 USDC 和 USDT 的捐赠必须*仅*从 Solana 区块链发送。请勿从任何其他网络（例如以太坊）发送，否则资金将丢失且无法到达目的地。此信息在捐赠页面上也有明确显示。',

    // Chatbot
    chatbot_title: 'OWFN 助手',
    chatbot_placeholder: '提问...',
    chatbot_error: '抱歉，我连接时遇到问题。请稍后再试。',
    
    // Whitepaper
    whitepaper_title: 'OWFN 白皮书',
    whitepaper_subtitle: '官方世界家庭网络项目详细概述',
    whitepaper_features_title: '项目生态系统与功能',
    whitepaper_features_desc: 'OWFN 平台提供多项关键功能以支持其使命：',
    whitepaper_feature_presale: '允许早期支持者在公开发售前购买 OWFN 代币。',
    whitepaper_feature_donations: '一个专门用于向影响力金库直接进行加密货币捐赠的门户。',
    whitepaper_feature_dashboard: '为实现完全透明而对所有官方项目钱包进行实时监控。',
    whitepaper_feature_impact_portal: '展示由项目资助的具体社会案例，让社区看到他们的影响力。',
    whitepaper_community_title: '社区与官方链接',
    whitepaper_community_desc: '加入我们不断壮大的社区，了解最新消息：',

    // Alerts & Messages
    transaction_success_alert: '交易成功！您已发送 {amount} {tokenSymbol}。',
    transaction_failed_alert: '交易失败。请重试。',
    translation_error_alert: '翻译过程中发生错误。案例未创建。请重试。',
    invalid_amount_generic: '请输入有效金额。',
    vote_success_alert: '您的投票已成功记录！',

    // Footer
    footer_copyright: '© {year} 官方世界家庭网络。保留所有权利。',

    // Token Detail Page
    token_detail_title: '代币分析',
    back_to_dashboard: '返回仪表板',
    back_to_profile: '返回个人资料',
    token_not_found: '未找到代币数据。',
    token_description_title: '代币描述',
    sell: '卖出',
    market_cap: '市值',
    liquidity: '流动性',
    volume_24h: '24小时交易量',
    pair_address: '交易对地址',
    mint_authority: '铸币权',

    freeze_authority: '冻结权',
    fully_diluted_valuation: '完全稀释估值 (FDV)',
    market_stats: '市场统计',
    trading_activity: '交易活动',
    buys_24h: '买入 (24小时)',
    sells_24h: '卖出 (24小时)',
    total_transactions_24h: '总交易数 (24小时)',
    token_supply: '代币供应量',
    decimals: '小数位数',
    pool_info: '流动性池信息',
    exchange: '交易所',
    pool_age: '池子年龄',
    on_chain_security: '链上安全',
    update_authority: '更新权',
    
    // Staking & Vesting
    staking_title: '质押 OWFN，赚取奖励',
    staking_subtitle: '锁定您的 OWFN 代币以赚取奖励并支持网络。',
    total_staked: '总质押量',
    estimated_apy: '预计年化收益率',
    my_staked_balance: '我的质押余额',
    stake: '质押',
    unstake: '取消质押',
    balance: '余额',
    stake_owfn: '质押 OWFN',
    unstake_owfn: '取消质押 OWFN',
    my_rewards: '我的奖励',
    claim_rewards: '领取奖励',
    staking_connect_title: '连接以进行质押',
    staking_connect_prompt: '连接您的钱包以开始质押您的 OWFN 代币并赚取奖励。',
    stake_success_alert: '成功质押 {amount} OWFN！',
    unstake_success_alert: '成功取消质押 {amount} OWFN！',
    claim_success_alert: '成功领取 {amount} OWFN 奖励！',
    impact_staking_title: '影响力质押',
    impact_staking_desc: '将您的一部分质押奖励捐赠给社会事业。',
    donate_rewards_percentage: '您将把领取的奖励的 {percentage}% 捐赠给影响力金库。',
    vesting_title: '代币归属',
    vesting_subtitle: '跟踪您的代币归属时间表并领取已解锁的代币。',
    vesting_connect_title: '连接以查看归属',
    vesting_connect_prompt: '连接您的钱包以查看您的个人归属时间表。',
    no_vesting_schedule: '未找到归属时间表',
    no_vesting_schedule_desc: '连接的钱包地址没有关联的归属时间表。',
    my_vesting_schedule: '我的归属时间表',
    total_allocation: '总分配量',
    claimed: '已领取',
    remaining: '剩余',
    vesting_progress: '归属进度',
    start_date: '开始日期',
    end_date: '结束日期',
    cliff_period: '悬崖期结束',
    claimable_now: '现在可领取',
    claim_tokens: '领取代币',
    vesting_claim_success: '成功领取 {amount} 已归属的 OWFN 代币！',
    create_vesting_schedule: '创建新的归属时间表',
    recipient_address: '接收方地址',
    total_amount_owfn: '总金额 (OWFN)',
    vesting_duration_months: '归属期（月）',
    cliff_period_months: '悬崖期（月）',
    create_schedule: '创建时间表',
    vesting_schedule_created: '归属时间表创建成功！',
    all_vesting_schedules: '所有归属时间表',

    // Airdrop
    airdrop_title: 'OWFN 代币空投',
    airdrop_subtitle: '检查您是否有资格参加我们的社区空投和奖励。',
    airdrop_check_eligibility: '检查我的资格',
    airdrop_checking: '正在检查资格...',
    airdrop_connect_prompt: '连接您的钱包以检查您是否有资格参加空投。',
    airdrop_congratulations: '恭喜！',
    airdrop_eligible_message: '您的钱包符合资格！您将在即将到来的分发中收到 {amount} OWFN 代币。',
    airdrop_not_eligible: '不符合资格',
    airdrop_not_eligible_message: '抱歉，此钱包地址不符合当前空投的资格。请继续在我们的社区中保持活跃，以获取未来的机会！',
    airdrop_info_box_title: '关于此次空投',
    airdrop_info_box_desc: '此次空投旨在奖励早期支持者和活跃的社区成员。资格基于参与预售和社区活动等因素。',

    // Governance
    governance_title: '治理',
    governance_subtitle: '通过对提案进行投票来参与 OWFN 的未来。',
    active_proposals: '进行中的提案',
    past_proposals: '过去的提案',
    create_proposal: '创建提案',
    proposal_title: '提案标题',
    proposal_description: '描述',
    submit_proposal: '提交提案',
    vote_for: '投赞成票',
    vote_against: '投反对票',
    votes_for: '赞成',
    votes_against: '反对',
    ends_in: '结束于',
    status_active: '进行中',
    status_passed: '已通过',
    status_failed: '未通过',
    you_voted: '您已投票',
    no_active_proposals: '目前没有进行中的提案。',
    no_past_proposals: '没有可显示的过去提案。',
    no_active_cases_in_category: '此类别目前没有活动案例。',
    
    // Maintenance
    maintenance_heading: '我们正在改进！',
    maintenance_message: '我们的平台目前正在进行定期维护，以改善您的体验。感谢您的耐心和理解。我们将很快恢复在线。',
    maintenance_stay_tuned: '请关注我们社交渠道的更新：',
    admin_controls: '管理员控制',
    maintenance_status: '状态',
    maintenance_status_active: '活跃',
    maintenance_status_inactive: '不活跃',
    activate_maintenance_mode: '激活维护模式',
    deactivate_maintenance_mode: '停用维护模式',
    admin_login: '管理员登录',
    maintenance_login_denied: '连接被拒绝。平台处于维护模式。只有管理员可以登录。',
    
    // Coming Soon
    coming_soon_title: '即将推出',
    coming_soon_desc: '此功能目前正在开发中。我们正在努力尽快为您带来。感谢您的耐心和支持。',
};
const translations: Record<string, Record<string, string>> = { en, zh }; // Add all other languages here later


// This function generates the knowledge base for the AI. It's moved here to be used on the server-side.
const generateKnowledgeBase = (langCode: string): string => {
  const t = translations[langCode] || translations['en'];

  return `
You are a helpful and friendly AI assistant for the "Official World Family Network (OWFN)" project. Your primary goal is to provide accurate and comprehensive information to users based on the knowledge provided below. Always be positive and supportive of the project's mission. Your response should be in the user's language, which is identified by the language code '${langCode}'.

**1. Core Project Information**

*   **Full Name:** Official World Family Network (OWFN)
*   **Mission:** ${t['about_mission_desc']}
*   **Vision:** ${t['about_vision_desc']}
*   **Core Message:** ${t['home_message']}
*   **Impact Areas:** We focus on three key areas:
    *   **Health:** ${t['about_impact_health_desc']}
    *   **Education:** ${t['about_impact_education_desc']}
    *   **Basic Needs:** ${t['about_impact_needs_desc']}

**2. OWFN Token Details**

*   **Total Supply:** ${TOKEN_DETAILS.totalSupply.toLocaleString()} OWFN
*   **Token Decimals:** ${TOKEN_DETAILS.decimals}
*   **Token Standard:** ${TOKEN_DETAILS.standard} on the Solana blockchain.
*   **Mint Address:** ${OWFN_MINT_ADDRESS}
*   **Active Extensions:** The token utilizes Token 2022 extensions for advanced features:
    *   **Transfer Fee (0.5%):** This is an on-chain mechanism that can be used to support the project's treasury and initiatives, ensuring transparency.
    *   **Interest-Bearing (2% APR):** This is a technical capability of the token standard. It's not a direct staking APY for holders but an on-chain feature demonstrating the token's advanced nature. The project rewards long-term holders through this mechanism, contributing to social good.
*   **Security:** The OWFN token is designed for maximum security and decentralization.
    *   **Immutability:** The token's core metadata cannot be changed.
    *   **Mint Authority:** Revoked. This means no new tokens can ever be created, ensuring a fixed total supply.
    *   **Freeze Authority:** Revoked. This means no single entity can freeze the holdings of any user, ensuring user autonomy.

**3. Tokenomics & Distribution**

*   **Presale Price:** ${TOKEN_DETAILS.presalePrice}
*   **DEX Launch Price:** ${TOKEN_DETAILS.dexLaunchPrice}
*   **Token Allocation:**
${TOKEN_ALLOCATIONS.map(a => `    *   **${a.name}:** ${a.percentage}% (${a.value.toLocaleString()} OWFN)`).join('\n')}
*   **Official Wallet Addresses:** All project wallets are public for full transparency.
    *   **Presale & Liquidity:** ${DISTRIBUTION_WALLETS.presale}
    *   **Impact Treasury:** ${DISTRIBUTION_WALLETS.impactTreasury}
    *   **Community & Ecosystem:** ${DISTRIBUTION_WALLETS.community}
    *   **Team & Founders:** ${DISTRIBUTION_WALLETS.team}
    *   **Marketing & Biz Dev:** ${DISTRIBUTION_WALLETS.marketing}
    *   **Advisors & Partnerships:** ${DISTRIBUTION_WALLETS.advisors}

**4. Website & Platform Features**

The OWFN website is a central hub for our community and provides full transparency. Key pages include:
*   **Home:** An overview of our mission and vision.
*   **About:** Detailed information about our mission, vision, and areas of impact.
*   **Whitepaper:** **Yes, the project has a detailed Whitepaper.** You can access it from the "Whitepaper" link in the main navigation menu. It contains a comprehensive overview of the project's goals, technology, tokenomics, roadmap, and ecosystem.
*   **Presale:** Allows early supporters to purchase OWFN tokens before the public launch.
*   **Tokenomics:** Shows the detailed token distribution, supply, and economic model, including a visual chart.
*   **Roadmap:** Outlines the project's strategic plan and future development phases.
*   **Donations:** A portal for direct cryptocurrency donations to the Impact Treasury.
*   **Dashboard:** A transparency dashboard for real-time monitoring of all official project wallet balances. You can also click on tokens to see more detailed analytics.
*   **Impact Portal:** Showcases the specific social cases being funded by the project. Users can see where funds are going and the impact they are having. Admins can create new cases.
*   **Profile:** Allows users to connect their wallets to view their token balances.
*   **Partnerships:** Information about current and future collaboration efforts.
*   **FAQ:** A list of frequently asked questions.

**5. Project Roadmap**
${ROADMAP_DATA.map(p => `*   **${p.quarter} (${t[p.key_prefix + '_title']}):** ${t[p.key_prefix + '_description']}`).join('\n')}

**6. Community & Links**

*   **Website:** ${PROJECT_LINKS.website}
*   **X.com (Twitter):** ${PROJECT_LINKS.x}
*   **Telegram Group:** ${PROJECT_LINKS.telegramGroup}
*   **Discord Server:** ${PROJECT_LINKS.discord}

**7. Common Questions & Answers**

*   **Q: ${t['faq_q1']}**
    *   **A:** ${t['faq_a1']}
*   **Q: ${t['faq_q2']}**
    *   **A:** ${t['faq_a2']}
*   **Q: ${t['faq_q4']}**
    *   **A:** ${t['faq_a4']}
*   **Q: ${t['faq_q5']}**
    *   **A:** ${t['faq_a5']}
*   **Q: ${t['faq_q6']}**
    *   **A:** ${t['faq_a6']}
*   **Q: ${t['faq_q7']}**
    *   **A:** ${t['faq_a7']}
*   **Q: ${t['faq_q8']}**
    *   **A:** ${t['faq_a8']}
*   **Q: ${t['faq_q9']}**
    *   **A:** ${t['faq_a9']}
*   **Q: ${t['faq_q10']}**
    *   **A:** ${t['faq_a10']}
`;
};

// Vercel Edge Functions syntax
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "API key not configured." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    try {
        const { history, question, langCode } = await request.json();
        
        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-2.5-flash";

        const chat = ai.chats.create({
          model,
          config: {
            systemInstruction: generateKnowledgeBase(langCode),
          },
          history,
        });
        
        const response = await chat.sendMessage({ message: question });

        return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Gemini API error in serverless function:", error);
        return new Response(JSON.stringify({ error: "Failed to get response from AI." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
