import React, { FC, useCallback, useMemo, useState } from 'react';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useRouter } from 'next/navigation';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useModals } from '@mantine/modals';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ResearchDto } from '@gitroom/nestjs-libraries/dtos/research/research.dto';
import { Button } from '@gitroom/react/form/button';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Textarea } from '@gitroom/react/form/textarea';
import clsx from 'clsx';
import {
  CalendarWeekProvider,
  useCalendar,
} from '@gitroom/frontend/components/launches/calendar.context';

const ResearchForm: FC = () => {
  const modal = useModals();
  const fetch = useFetch();
  const [loading, setLoading] = useState(false);
  const [researchStep, setResearchStep] = useState('');
  const [researchResults, setResearchResults] = useState<{
    summary: string;
    search_results: string[];
  } | null>(null);
  
  const resolver = useMemo(() => {
    return classValidatorResolver(ResearchDto);
  }, []);

  const form = useForm({
    mode: 'all',
    resolver,
    values: {
      query: '',
    },
  });

  const [query] = form.watch(['query']);

  const onSubmit: SubmitHandler<{
    query: string;
  }> = useCallback(
    async (value) => {
      setLoading(true);
      setResearchResults(null);
      setResearchStep('Researching your topic...');
      
      try {
        const response = await fetch('/research', {
          method: 'POST',
          body: JSON.stringify(value),
        });

        const data = await response.json();
        
        if (data.success) {
          setResearchResults(data.data);
        } else {
          console.error('Research error:', data.error);
        }
      } catch (error) {
        console.error('Error performing research:', error);
      } finally {
        setResearchStep('');
        setLoading(false);
      }
    },
    []
  );

  const closeAll = useCallback(() => {
    modal.closeAll();
  }, [modal]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormProvider {...form}>
        <div className="bg-seventh rounded-[4px] p-[24px]">
          <div className="flex flex-col gap-[24px]">
            <div>
              <Textarea
                label="Research Topic"
                disabled={loading}
                placeholder="Enter a topic or question you want to research (e.g., 'Latest advancements in AI', 'Climate change solutions')"
                rows={4}
                {...form.register('query')}
              />
            </div>
          </div>
        </div>
        <div className="mt-[20px] flex justify-end">
          <Button
            type="submit"
            disabled={query.length < 10}
            loading={loading}
          >
            Research
          </Button>
        </div>
      </FormProvider>
      
      {researchStep && (
        <div className="mt-5 p-4 bg-sixth rounded-md">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <p>{researchStep}</p>
          </div>
        </div>
      )}
      
      {researchResults && (
        <div className="mt-5 bg-sixth rounded-md p-6">
          <h3 className="text-xl font-medium mb-4">Research Report</h3>
          <div className="whitespace-pre-wrap mb-6 text-sm">
            {researchResults.summary}
          </div>
        </div>
      )}
    </form>
  );
};

export const ResearchPopup = () => {
  const modals = useModals();

  const closeAll = useCallback(() => {
    modals.closeAll();
  }, [modals]);

  return (
    <div className="bg-sixth p-[32px] w-full max-w-[920px] mx-auto flex flex-col rounded-[4px] border border-customColor6 relative">
      <button
        onClick={closeAll}
        className="outline-none absolute right-[20px] top-[15px] mantine-UnstyledButton-root mantine-ActionIcon-root hover:bg-tableBorder cursor-pointer mantine-Modal-close mantine-1dcetaa"
        type="button"
      >
        <svg
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
        >
          <path
            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
      <h1 className="text-[24px] mb-6">Research Bot</h1>
      <ResearchForm />
    </div>
  );
};

export const ResearchComponent = () => {
  const user = useUser();
  const router = useRouter();
  const modal = useModals();
  const all = useCalendar();

  const openResearch = useCallback(async () => {
    if (!user?.tier?.ai) {
      if (
        await deleteDialog(
          'You need to upgrade to use this feature',
          'Move to billing',
          'Payment Required'
        )
      ) {
        router.push('/billing');
      }
      return;
    }

    modal.openModal({
      title: '',
      withCloseButton: false,
      classNames: {
        modal: 'bg-transparent text-textColor',
      },
      size: '100%',
      children: (
        <CalendarWeekProvider {...all}>
          <ResearchPopup />
        </CalendarWeekProvider>
      ),
    });
  }, [user, all, router, modal]);

  return (
    <button
      className="p-[8px] rounded-md bg-blue-600 flex justify-center items-center gap-[5px] outline-none text-white"
      onClick={openResearch}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" 
          fill="currentColor"
        />
      </svg>
      <div className="flex-1 text-left">Research Bot</div>
    </button>
  );
}; 