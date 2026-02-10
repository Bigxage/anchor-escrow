use anchor_lang::prelude::*;

declare_id!("8NhuWR3KaDBTyzGVG8BF8Z45YhmL1YnEcwJtDWZ5VNVR");

#[program]
pub mod escrow {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
