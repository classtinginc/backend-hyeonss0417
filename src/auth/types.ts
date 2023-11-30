export interface TokenPayload {
  /**
   * 유저 ID
   */
  sub: number;
}

export interface SignUp {
  /**
   * 유저 이메일
   */
  email: string;
  /**
   * 관리자 여부
   */
  isAdmin: boolean;
}
