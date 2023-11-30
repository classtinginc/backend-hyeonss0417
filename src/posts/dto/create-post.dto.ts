export class CreatePostDto {
  /**
   * 학교 페이지 ID
   */
  pageId!: number;

  /**
   * 뉴스 제목
   */
  title!: string;

  /**
   * 뉴스 내용
   */
  content!: string;
}
