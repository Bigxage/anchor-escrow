import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import { createAssociatedTokenAccount } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createMint,
  mintTo
} from "@solana/spl-token";

describe("escrow", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Escrow as Program<Escrow>;
  const maker = provider.wallet;

  it("Make Escrow", async () => {
    const seed = new anchor.BN(1);
    const deposit = new anchor.BN(1000);
    const receive = new anchor.BN(2000);
    
    //creating mint_a
    const mintA = await createMint(
      provider.connection,
      maker.payer,
      maker.publicKey,
      null,
      6
    );

    //creating mint_b
    const mintB = await createMint(
      provider.connection,
      maker.payer,
      maker.publicKey,
      null,
      6
    );

    //maker ATA for mint_a
    const makerAtaA = await createAssociatedTokenAccount(
      provider.connection,
      maker.payer,
      mintA,
     maker.publicKey
    );

    //minting tokens to maker
    await mintTo(
      provider.connection,
      maker.payer,
      mintA,
      makerAtaA,
      maker.publicKey,
      1_000_000
    );

    //deriving escrow PDA
    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        maker.publicKey.toBuffer(),
        seed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    //deriving vault ATA
    const vault = getAssociatedTokenAddressSync(
      mintA,
      escrowPda,
      true,
    );

    const tx = await program.methods
    .make(seed, deposit, receive)
    .accounts({
      maker: maker.publicKey,
      mintA: mintA,
      mintB: mintB,
      makerAtaA: makerAtaA,
      escrow: escrowPda,
      vault: vault,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

    console.log("Your transaction signature", tx);
  });
});