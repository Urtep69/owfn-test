export interface SiwsMessageOptions {
    domain: string;
    address: string;
    statement?: string;
    uri: string;
    version: string;
    chainId: string;
    nonce: string;
    issuedAt: string;
}

/**
 * Creates a EIP-4361 compliant message for Sign-In with Solana.
 * @param options The message options.
 * @returns The formatted message string.
 */
export const createSiwsMessage = (options: SiwsMessageOptions): string => {
    const {
        domain,
        address,
        statement = 'Sign in with your Solana account to authenticate and proceed.',
        uri,
        version,
        chainId,
        nonce,
        issuedAt,
    } = options;

    return `${domain} wants you to sign in with your Solana account:
${address}

${statement}

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
};
