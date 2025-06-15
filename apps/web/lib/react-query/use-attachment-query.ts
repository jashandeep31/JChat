import {
  deleteAttachment,
  getAttachment,
  getAttachments,
} from "@/actions/attachment";
import { Attachment } from "@repo/db";
import { useMutation, useQuery } from "@tanstack/react-query";

const useAttachmentQuery = () => {
  const getAttachmentsQuery = useQuery<Attachment[]>({
    queryKey: ["attachments"],
    queryFn: async () => {
      return await getAttachments();
    },
    staleTime: 5 * 60 * 1000, //5min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteAttachment(id);
    },
    onSuccess: () => {
      getAttachmentsQuery.refetch();
    },
  });

  return {
    getAttachmentsQuery,
    deleteAttachmentMutation,
  };
};

export const getAttachmentQuery = (id: string | null) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Attachment | null>({
    queryKey: ["attachment", id],
    queryFn: async () => {
      if (!id) return null;
      return await getAttachment(id);
    },
    staleTime: 5 * 60 * 1000, //5min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!id,
  });
};

export default useAttachmentQuery;
